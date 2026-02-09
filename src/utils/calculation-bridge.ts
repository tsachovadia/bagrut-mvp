import { calculateOptimalAverage, applyBonuses, type SubjectGrade, type UniversityConfig, type PsychometricScores } from './calculator';
import { SECTOR_MANDATORY_SUBJECTS } from './subjects';
import { ALL_PROGRAMS } from '../data/programs';
import { checkReachable, type UserAdmissionStats } from './admission-evaluation';
import type { LogicGroup, LogicCondition } from '../types/admission';
import { calculateUniversityBonuses, type UniversityBonusStatus } from './bonuses';

export interface SimulationInsight {
    type: 'bonus' | 'average' | 'admission';
    message: string;
    impact: 'positive' | 'negative' | 'neutral';
    scoreChange?: number;
}


// 1. Define Default Config (The "University of Default" Logic)
export const DEFAULT_UNIV_CONFIG: UniversityConfig = {
    average_calculation: {
        min_units_for_optimization: 20,
        max_cap: 120
    },
    sechem_formulas: []
};

import { type Sector } from './subjects';

function determineSectorFromSubjects(grades: SubjectGrade[]): Sector {
    const subjectNames = new Set(grades.map(g => g.subject));

    if (subjectNames.has('עברית לדוברי ערבית')) {
        if (subjectNames.has('מורשת דרוזית')) return 'druze';
        return 'arab';
    }

    if (subjectNames.has('תלמוד / תושב״ע') || subjectNames.has('מחשבת ישראל')) {
        return 'mamlachti_dati';
    }

    return 'mamlachti';
}

function isLogicGroup(item: LogicGroup | LogicCondition): item is LogicGroup {
    return 'AND' in item || 'OR' in item;
}

export function calculateAdmissionStats(bagrutData: SubjectGrade[], psychoScore: PsychometricScores) {
    if (!bagrutData || bagrutData.length === 0) {
        return {
            bagrutAverage: 0,
            degrees: [],
            optimal: null
        };
    }

    const subjectsWithBonuses = applyBonuses(bagrutData);

    // Dynamic config based on student's sector
    const sector = determineSectorFromSubjects(bagrutData);

    // We update config if needed, but mandatory subjects are now handled by sector lookup in the calculator
    const dynamicConfig = {
        ...DEFAULT_UNIV_CONFIG,
        // Keep any other dynamic properties we might want to override
    };

    // Calculate optimal for GENERAL university (default)
    const optimal = calculateOptimalAverage(subjectsWithBonuses, sector, 'general', dynamicConfig);
    const psychoTotal = psychoScore.total || 550;

    // Base score for general estimation (if specific legacy formula is needed)
    // const baseScore = (optimal.average * 4) + (psychoTotal * 0.4);

    // Prepare stats object for evaluation
    const userStats: UserAdmissionStats = {
        bagrutAverage: optimal.average,
        bagrutGrades: bagrutData,
        psychometric: psychoScore,
        estimatedSekhem: (optimal.average * 0.5) + (psychoTotal * 0.5) // Crude estimation if needed by legacy
    };

    const allDegreesResults = ALL_PROGRAMS.map((p) => {
        const isReachable = checkReachable(userStats, p.admission);

        // Try to find a threshold in the logic descriptions for display
        let thresholdDisplay = "לא צוין";
        if (p.admission?.logic_rules?.OR) {
            const firstRule = p.admission.logic_rules.OR[0];
            if (isLogicGroup(firstRule) && firstRule.AND) {
                const sekhemCond = firstRule.AND.find((c) => !isLogicGroup(c) && c.type.startsWith('sekhem')) as LogicCondition | undefined;
                if (sekhemCond && sekhemCond.value) {
                    thresholdDisplay = `${sekhemCond.value}`;
                }
            }
        }

        const sechemScoreObj = {
            name: p.program.name,
            score: userStats.estimatedSekhem, // This is a placeholder; ideally we'd calc specific uni sekhem
            type: 'general',
            explanation: `תנאי קבלה: ${thresholdDisplay}`
        };

        return {
            name: p.program.name, // Added this field as it's used in TargetsPanel
            university: p.program.institution?.name || "לא ידוע",
            institutionId: p.program.institution?.id, // Added for unified filtering
            average: optimal.average,
            description: `סף משוער: ${thresholdDisplay}`,
            calculation: "חישוב משוער",
            status: isReachable ? 'excellent' : 'needs-improvement',
            programs: 1,
            acceptanceProbability: isReachable ? 95 : 10,
            sechem: [sechemScoreObj],
            detailedResults: {
                sechem_scores: [sechemScoreObj]
            }
        };
    });

    return {
        bagrutAverage: optimal.average,
        degrees: allDegreesResults,
        optimal
    };
}

export function generateSimulationInsights(
    originalStats: any,
    simulatedStats: any
): SimulationInsight[] {
    const insights: SimulationInsight[] = [];

    if (!originalStats || !simulatedStats) return insights;

    // 1. Average Change
    const avgDiff = simulatedStats.bagrutAverage - originalStats.bagrutAverage;
    if (Math.abs(avgDiff) > 0.1) {
        insights.push({
            type: 'average',
            message: `ממוצע הבגרות ${avgDiff > 0 ? 'עלה' : 'ירד'} ב-${Math.abs(avgDiff).toFixed(2)} נקודות`,
            impact: avgDiff > 0 ? 'positive' : 'negative',
            scoreChange: avgDiff
        });
    }

    // 2. Bonus Analysis (Deep Logic)
    // We need to recalculate bonuses to compare them directly if not available in stats
    // Assuming we have access to the raw grades in the stats object or passed separately would be better,
    // but here we might have to infer or recalculate if 'optimal' contains the breakdown.
    // For now, let's use the 'degrees' sechem scores as a proxy for specific impacts.

    // 3. Admission Threshold Shifts
    simulatedStats.degrees.forEach((simDegree: any, idx: number) => {
        const origDegree = originalStats.degrees.find((d: any) => d.name === simDegree.name && d.university === simDegree.university);
        if (!origDegree) return;

        const simScore = simDegree.sechem[0]?.score || 0;
        const origScore = origDegree.sechem[0]?.score || 0;
        const diff = simScore - origScore;

        // Only report significant changes in relevant degrees (e.g. not universally accepted ones)
        if (Math.abs(diff) >= 1) {
            insights.push({
                type: 'admission',
                message: `הסכם ל${simDegree.name} (${simDegree.university}) ${diff > 0 ? 'עלה' : 'ירד'} ב-${Math.abs(diff).toFixed(0)} נקודות`,
                impact: diff > 0 ? 'positive' : 'negative',
                scoreChange: diff
            });
        }
    });

    return insights;
}

