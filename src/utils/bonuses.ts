export interface BonusRule {
    minUnits: number;
    bonus: number;
    minGrade?: number;
    subjectTypes?: string[]; // e.g., 'math', 'english', 'scientific', 'technical'
}

// Standard University Bonus Scheme (Based on TAU/Hebrew U baseline)
export const BONUS_RULES: Record<string, BonusRule[]> = {
    'mathematics': [
        { minUnits: 5, bonus: 35, minGrade: 60 },
        { minUnits: 4, bonus: 12.5, minGrade: 60 }
    ],
    'english': [
        { minUnits: 5, bonus: 25, minGrade: 60 },
        { minUnits: 4, bonus: 12.5, minGrade: 60 }
    ],
    'physics': [
        { minUnits: 5, bonus: 25, minGrade: 60 } // Often 20-30, 25 is a solid average for high-demand
    ],
    // Catch-all for other 5-unit subjects (History, Lit, Bible, etc. extended)
    'other': [
        { minUnits: 5, bonus: 20, minGrade: 60 },
        { minUnits: 4, bonus: 10, minGrade: 60 }
    ]
};

export const getSubjectType = (subjectName: string): string => {
    const normalize = (s: string) => s.trim().toLowerCase();
    const name = normalize(subjectName);

    if (name.includes('מתמטיקה') || name.includes('math')) return 'mathematics';
    if (name.includes('אנגלית') || name.includes('english')) return 'english';
    if (name.includes('פיזיקה') || name.includes('physics')) return 'physics';

    return 'other';
};

export const calculateBonus = (subjectName: string, units: number, grade: number): number => {
    if (grade < 60) return 0; // No bonus for failures

    const type = getSubjectType(subjectName);
    const rules = BONUS_RULES[type] || BONUS_RULES['other'];

    // Find the rule that matches the unit count
    const rule = rules.find(r => r.minUnits === units);
    return rule ? rule.bonus : 0;
};
