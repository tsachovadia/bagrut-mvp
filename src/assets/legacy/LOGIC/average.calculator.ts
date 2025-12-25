// supabase/functions/_shared/core-logic/average.calculator.ts
import type { SubjectGrade, UniversityConfig } from './types.ts';

type SubjectWithBonus = SubjectGrade & { adjusted_grade: number; bonus: number; weight?: number, effectiveUnits?: number };

function calculateWeightedAverage(subjects: SubjectWithBonus[]): number {
  const totalWeightedGrade = subjects.reduce((sum, s) => sum + (s.adjusted_grade * (s.effectiveUnits || s.units)), 0);
  const totalUnits = subjects.reduce((sum, s) => sum + (s.effectiveUnits || s.units), 0);
  return totalUnits > 0 ? totalWeightedGrade / totalUnits : 0;
}

/**
 * מחשב את ממוצע הבגרות האופטימלי על ידי השמטת מקצועות בחירה שמורידים את הממוצע.
 * @param subjectsWithBonuses - ציוני בגרות לאחר החלת בונוסים.
 * @param config - אובייקט הקונפיגורציה של האוניברסיטה.
 * @returns אובייקט עם הממוצע האופטימלי, רשימת המקצועות שנכללו ואלו שהושמטו.
 */
export function calculateOptimalAverage(subjectsWithBonuses: SubjectWithBonus[], config: UniversityConfig) {
  const { mandatory_subjects = [], min_units_for_optimization = 20, max_cap = 150 } = config.average_calculation;

  const mandatory = subjectsWithBonuses.filter(s => mandatory_subjects.includes(s.subject));
  const droppable = subjectsWithBonuses.filter(s => !mandatory_subjects.includes(s.subject))
                                      .sort((a, b) => a.adjusted_grade - b.adjusted_grade); // התחל להשמיט מהנמוכים

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

  const droppedSubjects = subjectsWithBonuses.filter(s => !currentBestCombination.find(cs => cs.id === s.id));
  
  return {
    average: Math.min(currentBestAverage, max_cap),
    subjects_used: currentBestCombination,
    subjects_dropped: droppedSubjects,
    explanation: `הממוצע חושב מ-${currentBestCombination.length} מקצועות לאחר השמטת ${droppedSubjects.length} מקצועות.`
  };
}