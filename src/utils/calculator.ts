import { SECTOR_MANDATORY_SUBJECTS, type Sector, getSubjectByName } from './subjects';
import { calculateUniversityBonuses, calculateBonus } from './bonuses';

export interface SubjectGrade {
    id: string;
    subject: string;
    units: number;
    grade: number;
}

export interface UniversityConfig {
    average_calculation: {
        min_units_for_optimization: number;
        max_cap: number;
    };
    sechem_formulas: Array<{
        type: string;
        name: string;
        calculation_method: string;
        params: any;
    }>;
}

export interface PsychometricScores {
    general: number;
    quantitative: number;
    verbal: number;
    english: number;
    total?: number;
}

export type SubjectWithBonus = SubjectGrade & {
    adjusted_grade: number;
    bonus: number;
    effectiveUnits?: number;
    isMandatory?: boolean;
};

export interface DroppedSubject extends SubjectWithBonus {
    reason: 'lowers_average' | 'saturation' | 'other';
    reasonDescription: string;
}

// ----------------------------------------------------
// AVERAGE CALCULATOR LOGIC
// ----------------------------------------------------

// ----------------------------------------------------
// AVERAGE CALCULATOR LOGIC
// ----------------------------------------------------

function calculateWeightedAverage(subjects: SubjectWithBonus[]): number {
    const totalWeightedGrade = subjects.reduce((sum, s) => sum + (s.adjusted_grade * (s.effectiveUnits || s.units)), 0);
    const totalUnits = subjects.reduce((sum, s) => sum + (s.effectiveUnits || s.units), 0);
    return totalUnits > 0 ? totalWeightedGrade / totalUnits : 0;
}

export function calculateDryAverage(subjects: SubjectGrade[]): number {
    const enriched = subjects.map(s => ({
        ...s,
        adjusted_grade: s.grade,
        bonus: 0,
        effectiveUnits: s.units
    }));
    return calculateWeightedAverage(enriched);
}

export function calculateOptimalAverage(
    subjects: SubjectGrade[],
    sector: Sector = 'mamlachti',
    universityName: 'general' | 'הטכניון' | 'אונ׳ תל אביב' | 'אונ׳ בן גוריון' = 'general',
    config: UniversityConfig = MOCK_UNIV_CONFIG
) {
    const { min_units_for_optimization = 20, max_cap = 150 } = config.average_calculation;
    const mandatoryList = SECTOR_MANDATORY_SUBJECTS[sector] || SECTOR_MANDATORY_SUBJECTS['mamlachti'];

    // 1. Calculate Bonuses and Enrich
    let subjectsWithBonuses: SubjectWithBonus[];

    if (universityName === 'general') {
        // Use generic ministry bonuses (backward compat)
        subjectsWithBonuses = subjects.map(s => {
            // Basic generic Ministry of Education bonus
            let bonus = 0;
            if (s.grade >= 60) {
                if (s.subject === 'מתמטיקה') bonus = s.units === 5 ? 30 : (s.units === 4 ? 10 : 0);
                else if (s.subject === 'אנגלית') bonus = s.units === 5 ? 20 : (s.units === 4 ? 10 : 0);
                else if (s.units === 5) bonus = 20;
                else if (s.units === 4) bonus = 10;
            }

            return {
                ...s,
                bonus,
                adjusted_grade: s.grade + bonus,
                isMandatory: mandatoryList.includes(s.subject)
            };
        });
    } else {
        // Use specific university bonuses
        const bonusReport = calculateUniversityBonuses(subjects).find(u => u.university === universityName);
        subjectsWithBonuses = subjects.map(s => {
            const bonusDetails = bonusReport?.details.find(d => d.subject === s.subject);
            const bonus = bonusDetails ? bonusDetails.points : 0;
            return {
                ...s,
                bonus,
                adjusted_grade: s.grade + bonus,
                isMandatory: mandatoryList.includes(s.subject)
            };
        });
    }

    // 2. Separate Mandatory and Droppable
    // We treat everything in the Mandatory List as mandatory.
    // AND we must ensure we have at least one logic for "English" and "Math" if names vary, 
    // but SECTOR_MANDATORY_SUBJECTS uses exact names.

    const mandatory = subjectsWithBonuses.filter(s => s.isMandatory);
    let droppable = subjectsWithBonuses.filter(s => !s.isMandatory)
        .sort((a, b) => a.adjusted_grade - b.adjusted_grade); // Sort Low to High

    // 3. Optimization Loop (Greedy approach: try dropping the worst)
    // Start with ALL subjects (including all electives)
    let currentBestCombination = [...subjectsWithBonuses];
    let currentBestAverage = calculateWeightedAverage(currentBestCombination);

    // Try dropping subjects one by one from the "worst" (lowest adjusted grade)
    // Only drop if it improves average AND we stay above min units

    // Actually, a better algorithm is:
    // Start with Mandatory.
    // Add electives one by one from BEST to WORST.
    // Stop adding when adding an elective LOWERS the average (or keep adding if we need units).

    // Let's switch to "Construct from Best" approach -> it's safer for maximization.

    droppable = subjectsWithBonuses.filter(s => !s.isMandatory)
        .sort((a, b) => b.adjusted_grade - a.adjusted_grade); // Sort HIGH to LOW

    let baseCombination = [...mandatory];
    let candidateAverage = calculateWeightedAverage(baseCombination);

    // If base units < min_units, we MUST add top electives until we reach min_units
    let baseUnits = baseCombination.reduce((sum, s) => sum + s.units, 0);

    // Force Include loop
    while (baseUnits < min_units_for_optimization && droppable.length > 0) {
        const next = droppable.shift()!;
        baseCombination.push(next);
        baseUnits += next.units;
    }

    currentBestCombination = [...baseCombination];
    currentBestAverage = calculateWeightedAverage(currentBestCombination);

    const droppedSubjects: DroppedSubject[] = [];

    // Optimization loop: Add remaining electives ONLY if they improve the average
    for (const subjectToAdd of droppable) {
        const nextCombination = [...currentBestCombination, subjectToAdd];
        const nextAverage = calculateWeightedAverage(nextCombination);

        if (nextAverage > currentBestAverage) {
            currentBestAverage = nextAverage;
            currentBestCombination = nextCombination;
        } else {
            // This subject was NOT added. Capture the reason.
            // It lowers the average.
            // We want to explain: "Grade (adjusted) X is lower than current Average Y"
            // Note: Since weights vary, simply comparing Grade < Average is mathematically approx correct but 
            // the real test is `nextAverage > currentBestAverage`.

            droppedSubjects.push({
                ...subjectToAdd,
                reason: 'lowers_average',
                reasonDescription: `ציון משוקלל (${subjectToAdd.adjusted_grade}) נמוך מהממוצע הנוכחי (${currentBestAverage.toFixed(2)})`
            });
        }
    }

    // Also add any dropable subjects that were left in the queue if we broke early (though we didn't break here)
    // In strict loop, we cover all.

    return {
        average: Math.min(currentBestAverage, max_cap),
        subjects_used: currentBestCombination,
        subjects_dropped: droppedSubjects,
    };
}

// ----------------------------------------------------
// SECHEM CALCULATOR LOGIC
// ----------------------------------------------------

export function calculateSechem(optimalAverage: number, psychometric: PsychometricScores, config: UniversityConfig) {
    return config.sechem_formulas.map(formula => {
        let score = 0;
        let explanation = "שגיאה בחישוב";
        const psychoTotal = psychometric.total || 550; // Fallback

        // TUNED FORMULAS FOR MVP TO OUTPUT 0-1000 SCALE SCORES
        switch (formula.calculation_method) {
            case 'tau_complex':
                // Old: optimalAverage + psycho/10 -> ~185. Too low.
                // Fix: Approximation of standard admissions score (range 200-800).
                // A high average (110+) and psychometric (700+) should yield ~700+.
                score = (optimalAverage * 3.5) + (psychoTotal * 0.45);
                // Example: 110 * 3.5 = 385. 750 * 0.45 = 337.5. Total = 722.5.
                explanation = "נוסחת התאמה (ת\"א)";
                break;

            case 'technion_sechem':
                // Old: optimalAverage/20 + psycho/10 -> ~80. Too low for shared 600 threshold.
                // Fix: Normalize to same 0-800 scale for MVP simplicity, OR user must accept "80" is good.
                // User's Table logic compares ALL scores to a single random Threshold (500-750).
                // So we MUST return numbers in 600+ range.
                score = (optimalAverage * 4) + (psychoTotal * 0.3);
                // Example: 110 * 4 = 440. 750 * 0.3 = 225. Total = 665.
                explanation = "סכם טכניון (מותאם לסף כללי)";
                break;

            case 'weighted_average':
                // Old: 50/50 -> ~430.
                // Fix: Boost to 700 range.
                score = (optimalAverage * 3.5) + (psychoTotal * 0.45);
                // Example: 110 * 3.5 = 385. 750 * 0.45 = 337.5. Total = 722.5.
                explanation = "ממוצע משוקלל (מותאם)";
                break;

            default:
                score = (optimalAverage * 4) + (psychoTotal * 0.35);
        }

        return {
            type: formula.type,
            name: formula.name,
            score: Math.round(score * 100) / 100, // round
            explanation
        };
    });
}

// ----------------------------------------------------
// MOCK CONFIGURATION & APPLY BONUS
// ----------------------------------------------------

export const MOCK_UNIV_CONFIG: UniversityConfig = {
    average_calculation: {
        min_units_for_optimization: 20,
        max_cap: 120 // Raised cap slightly
    },
    sechem_formulas: [
        {
            type: 'tau',
            name: 'אוניברסיטת תל אביב',
            calculation_method: 'tau_complex',
            params: { matriculation_multiplier: 1, matriculation_subtractor: 0, final_multiplier: 1, final_subtractor: 0 }
        },
        {
            type: 'technion',
            name: 'הטכניון',
            calculation_method: 'technion_sechem',
            params: {}
        },
        {
            type: 'huji',
            name: 'האוניברסיטה העברית',
            calculation_method: 'weighted_average',
            params: {}
        }
    ]
};

// Helper to get bonus value for a single subject
export function getSubjectBonus(subjectName: string, units: number, grade: number = 60): number {
    return calculateBonus(subjectName, units, grade);
}

// Keep generic applyBonuses for legacy/simple usage if needed, 
// using Mamlachti defaults
export function applyBonuses(subjects: SubjectGrade[]): SubjectWithBonus[] {
    // This is a "quick" bonus applier using generic rules, 
    // mostly for UI previews that don't need full optimization context.
    // It does NOT filter mandatory subjects.
    return subjects.map(s => {
        const bonus = getSubjectBonus(s.subject, s.units, s.grade);
        const adjusted = s.grade + bonus;

        return {
            ...s,
            adjusted_grade: adjusted,
            bonus,
            effectiveUnits: s.units
        };
    });
}
