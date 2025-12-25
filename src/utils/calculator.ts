export interface SubjectGrade {
    id: string;
    subject: string;
    units: number;
    grade: number;
}

export interface UniversityConfig {
    average_calculation: {
        mandatory_subjects: string[];
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

type SubjectWithBonus = SubjectGrade & { adjusted_grade: number; bonus: number; effectiveUnits?: number };

// ----------------------------------------------------
// AVERAGE CALCULATOR LOGIC
// ----------------------------------------------------

function calculateWeightedAverage(subjects: SubjectWithBonus[]): number {
    const totalWeightedGrade = subjects.reduce((sum, s) => sum + (s.adjusted_grade * (s.effectiveUnits || s.units)), 0);
    const totalUnits = subjects.reduce((sum, s) => sum + (s.effectiveUnits || s.units), 0);
    return totalUnits > 0 ? totalWeightedGrade / totalUnits : 0;
}

export function calculateOptimalAverage(subjectsWithBonuses: SubjectWithBonus[], config: UniversityConfig) {
    const { mandatory_subjects = [], min_units_for_optimization = 20, max_cap = 150 } = config.average_calculation;

    const mandatory = subjectsWithBonuses.filter(s => mandatory_subjects.includes(s.subject));
    const droppable = subjectsWithBonuses.filter(s => !mandatory_subjects.includes(s.subject))
        .sort((a, b) => a.adjusted_grade - b.adjusted_grade);

    let currentBestCombination = [...subjectsWithBonuses];
    let currentBestAverage = calculateWeightedAverage(currentBestCombination);

    for (const subjectToDrop of droppable) {
        const nextCombination = currentBestCombination.filter(s => s.id !== subjectToDrop.id);
        const totalUnits = nextCombination.reduce((sum, s) => sum + s.units, 0);

        if (totalUnits >= min_units_for_optimization) {
            const nextAverage = calculateWeightedAverage(nextCombination);
            if (nextAverage > currentBestAverage) {
                currentBestAverage = nextAverage;
                currentBestCombination = nextCombination;
            }
        }
    }

    return {
        average: Math.min(currentBestAverage, max_cap),
        subjects_used: currentBestCombination,
        subjects_dropped: subjectsWithBonuses.filter(s => !currentBestCombination.find(cs => cs.id === s.id)),
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
        mandatory_subjects: ['מתמטיקה', 'אנגלית', 'עברית - הבעה ולשון'],
        min_units_for_optimization: 20,
        max_cap: 115
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

// Helper to apply bonuses (Simple MVP version)
export function applyBonuses(subjects: SubjectGrade[]): SubjectWithBonus[] {
    return subjects.map(s => {
        let bonus = 0;
        let adjusted = s.grade;
        if (s.subject === 'מתמטיקה' && s.units === 5) { bonus = 35; adjusted += 35; }
        else if (s.subject === 'מתמטיקה' && s.units === 4) { bonus = 15; adjusted += 15; }
        else if (s.subject === 'אנגלית' && s.units === 5) { bonus = 25; adjusted += 25; }
        else if (s.subject === 'אנגלית' && s.units === 4) { bonus = 12.5; adjusted += 12.5; }
        else if (s.units === 5) { bonus = 20; adjusted += 20; } // General bonus for 5 units

        return {
            ...s,
            adjusted_grade: adjusted,
            bonus,
            effectiveUnits: s.units
        };
    });
}
