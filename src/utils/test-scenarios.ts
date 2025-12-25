import type { SubjectGrade, PsychometricScores } from './calculator';
import { MANDATORY_SUBJECTS } from './subjects';

const createBagrutDefaults = (overrides: Partial<SubjectGrade>[] = [], defaultGrade = 85) => {
    // Start with mandatory
    const base = MANDATORY_SUBJECTS.map((s, i) => ({
        id: `mandatory-${i}`,
        subject: s.name,
        units: s.defaultUnits || 3,
        grade: defaultGrade
    }));

    // Apply overrides
    const result = base.map(s => {
        const override = overrides.find(o => o.subject === s.subject);
        return override ? { ...s, ...override } : s;
    });

    // Add elective overrides that weren't in mandatory
    overrides.forEach((o, i) => {
        if (!result.find(r => r.subject === o.subject)) {
            result.push({
                id: `elective-override-${i}`,
                subject: o.subject || 'Unknown',
                units: o.units || 5,
                grade: o.grade || defaultGrade
            });
        }
    });

    return result;
};

export const SCENARIOS = {
    genius: {
        name: 'The Genius',
        psychometric: { general: 750, quantitative: 145, verbal: 140, english: 145, total: 750 } as PsychometricScores,
        bagrut: createBagrutDefaults([
            { subject: 'מתמטיקה', units: 5, grade: 95 },
            { subject: 'אנגלית', units: 5, grade: 95 },
            { subject: 'פיסיקה', units: 5, grade: 90 }
        ], 90)
    },
    average: {
        name: 'The Average',
        psychometric: { general: 620, quantitative: 120, verbal: 120, english: 120, total: 620 } as PsychometricScores,
        bagrut: createBagrutDefaults([
            { subject: 'מתמטיקה', units: 4, grade: 80 },
            { subject: 'אנגלית', units: 5, grade: 85 },
            { subject: 'היסטוריה', units: 2, grade: 80 }
        ], 80)
    },
    struggler: {
        name: 'The Struggler',
        psychometric: { general: 550, quantitative: 110, verbal: 110, english: 100, total: 550 } as PsychometricScores,
        bagrut: createBagrutDefaults([
            { subject: 'מתמטיקה', units: 3, grade: 70 },
            { subject: 'אנגלית', units: 4, grade: 75 }
        ], 70)
    }
};
