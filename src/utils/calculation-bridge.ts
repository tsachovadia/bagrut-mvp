import { calculateOptimalAverage, type SubjectGrade, type UniversityConfig, type PsychometricScores } from './calculator';
import { degrees, type Degree } from './degrees';
import { SECTOR_MANDATORY_SUBJECTS } from './subjects';

// 1. Define Default Config (The "University of Default" Logic)
export const DEFAULT_UNIV_CONFIG: UniversityConfig = {
    average_calculation: {
        mandatory_subjects: ['מתמטיקה', 'אנגלית', 'עברית - הבעה ולשון', 'תנ"ך', 'ספרות', 'היסטוריה', 'אזרחות'],
        min_units_for_optimization: 20,
        max_cap: 120
    },
    sechem_formulas: []
};

// Internal helper to replicate logic with specific hardcoded bonuses
function applyAcademicBonuses(subjects: SubjectGrade[]) {
    return subjects.map(s => {
        let bonus = 0;
        let adjusted = s.grade;
        const name = s.subject;
        const units = s.units;

        if (name === 'מתמטיקה') {
            if (units === 5) bonus = 35;
            else if (units === 4) bonus = 15;
        } else if (name === 'אנגלית') {
            if (units === 5) bonus = 25;
            else if (units === 4) bonus = 12.5;
        } else if (name === 'פיסיקה' && units === 5) {
            bonus = 25;
        } else if (units === 5) {
            bonus = 20;
        } else if (units === 4) {
            bonus = 10;
        }

        adjusted += bonus;

        return {
            ...s,
            adjusted_grade: adjusted,
            bonus,
            effectiveUnits: units
        };
    });
}

function getMandatorySubjectsForStudent(grades: SubjectGrade[]): string[] {
    const subjectNames = new Set(grades.map(g => g.subject));

    if (subjectNames.has('עברית לדוברי ערבית')) {
        if (subjectNames.has('מורשת דרוזית')) return SECTOR_MANDATORY_SUBJECTS.druze;
        return SECTOR_MANDATORY_SUBJECTS.arab;
    }

    if (subjectNames.has('תלמוד / תושב״ע') || subjectNames.has('מחשבת ישראל')) {
        return SECTOR_MANDATORY_SUBJECTS.mamlachti_dati;
    }

    return SECTOR_MANDATORY_SUBJECTS.mamlachti;
}

export function calculateAdmissionStats(bagrutData: SubjectGrade[], psychoScore: PsychometricScores) {
    if (!bagrutData || bagrutData.length === 0) {
        return {
            bagrutAverage: 0,
            degrees: [],
            optimal: null
        };
    }

    const subjectsWithBonuses = applyAcademicBonuses(bagrutData);

    // Dynamic config based on student's sector
    const dynamicConfig = {
        ...DEFAULT_UNIV_CONFIG,
        average_calculation: {
            ...DEFAULT_UNIV_CONFIG.average_calculation,
            mandatory_subjects: getMandatorySubjectsForStudent(bagrutData)
        }
    };

    const optimal = calculateOptimalAverage(subjectsWithBonuses, dynamicConfig);
    const psychoTotal = psychoScore.total || 550;
    const baseScore = (optimal.average * 4) + (psychoTotal * 0.4);

    const UNIVERSITIES = ['אוניברסיטת תל אביב', 'הטכניון', 'האוניברסיטה העברית', 'אוניברסיטת בן גוריון', 'אוניברסיטת בר אילן'];

    const allDegreesResults = degrees.map((d: Degree) => {
        // Mock logic: Assign a random university to each degree just for display variety
        const uniIndex = d.degree_id % UNIVERSITIES.length;
        // In a real app, each degree belongs to a specific uni. Here we fake it.
        const uniName = UNIVERSITIES[uniIndex];

        const sechemScoreObj = {
            name: d.degree_name, // This appears as subtitle
            score: baseScore,
            type: 'general',
            explanation: `סף קבלה: ${d.threshold}`
        };

        return {
            university: uniName, // Main bold text
            average: optimal.average,
            description: `סף: ${d.threshold}`,
            calculation: "חישוב משוער",
            status: baseScore >= d.threshold ? 'excellent' : 'needs-improvement',
            programs: 1,
            acceptanceProbability: baseScore >= d.threshold ? 95 : 10,
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
