import type { SubjectGrade } from './calculator';


/**
 * University Bonus Rules
 */

export interface UniversityBonusStatus {
    university: string;
    totalBonus: number;
    details: { subject: string; units: number; points: number }[];
}

export const calculateUniversityBonuses = (grades: SubjectGrade[]): UniversityBonusStatus[] => {
    return [
        calculateTechnionBonuses(grades),
        calculateTelAvivBonuses(grades),
        calculateBenGurionBonuses(grades),
    ];
};



const calculateTechnionBonuses = (grades: SubjectGrade[]): UniversityBonusStatus => {
    const details: { subject: string; units: number; points: number }[] = [];
    let totalBonus = 0;

    grades.forEach(g => {
        if (g.units < 4) return;
        if (g.grade < 60) return; // Technion minimum grade for bonus

        let points = 0;
        // Category currently unused but kept for future logic if needed
        // const category = getSubjectCategory(g.subject);

        if (g.subject === 'מתמטיקה') {
            points = g.units === 5 ? 30 : 20; // estimate for 4 units
        } else if (g.subject === 'אנגלית') {
            points = g.units === 5 ? 25 : 10; // estimate for 4 units
        } else if (['פיזיקה', 'כימיה', 'ביולוגיה'].includes(g.subject) && g.units === 5) {
            points = 25; // Technion science bonus
        } else if (g.units === 5) {
            points = 20; // Default 5-unit bonus
        }

        // Technion "Technological" bonus (placeholder logic)
        if (g.subject === 'הנדסת תוכנה' || g.subject === 'מדעי המחשב') {
            if (g.units === 5) points = 25;
        }

        if (points > 0) {
            totalBonus += points;
            details.push({ subject: g.subject, units: g.units, points });
        }
    });

    return { university: 'הטכניון', totalBonus, details };
};


const calculateBenGurionBonuses = (grades: SubjectGrade[]): UniversityBonusStatus => {
    const details: { subject: string; units: number; points: number }[] = [];
    let totalBonus = 0;

    grades.forEach(g => {
        if (g.units < 4) return;

        let points = 0;
        if (g.subject === 'מתמטיקה') {
            points = g.units === 5 ? 35 : 10; // Verified 35 for 5 units
        } else if (['פיזיקה', 'כימיה', 'ביולוגיה', 'מדעי המחשב', 'הנדסת תוכנה'].includes(g.subject)) {
            points = g.units === 5 ? 25 : 10;
        } else if (g.subject === 'אנגלית') {
            points = g.units === 5 ? 25 : 10;
        } else if (g.units === 5) {
            points = 20;
        } else if (g.units === 4) {
            points = 10;
        }

        if (points > 0) {
            totalBonus += points;
            details.push({ subject: g.subject, units: g.units, points });
        }
    });

    return { university: 'אונ׳ בן גוריון', totalBonus, details };
};

const calculateTelAvivBonuses = (grades: SubjectGrade[]): UniversityBonusStatus => {
    const details: { subject: string; units: number; points: number }[] = [];
    let totalBonus = 0;

    grades.forEach(g => {
        if (g.units < 4) return;

        let points = 0;

        if (g.subject === 'מתמטיקה') {
            points = g.units === 5 ? 30 : 15; // Reverting to safer classic estimate
        } else if (g.units === 5) {
            points = 25; // Generic 5 unit bonus for TAU (often higher for humanities than others)
        } else if (g.units === 4) {
            points = 10;
        }

        if (points > 0) {
            totalBonus += points;
            details.push({ subject: g.subject, units: g.units, points });
        }
    });

    return { university: 'אונ׳ תל אביב', totalBonus, details };
};

// Single source of truth for generic (Ministry-standard) bonus calculations.
// All other files should use this function instead of inline bonus logic.
export const calculateBonus = (subject: string, units: number, grade: number): number => {
    if (grade < 60) return 0;
    if (subject === 'מתמטיקה') {
        if (units === 5) return 35;
        if (units === 4) return 15;
    }
    if (subject === 'אנגלית') {
        if (units === 5) return 25;
        if (units === 4) return 12.5;
    }
    if (subject === 'פיסיקה' && units === 5) return 25;
    if (units === 5) return 20;
    if (units === 4) return 10;
    return 0;
};
