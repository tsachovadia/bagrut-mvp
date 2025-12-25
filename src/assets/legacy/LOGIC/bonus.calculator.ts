// supabase/functions/_shared/core-logic/bonus.calculator.ts
import type { SubjectGrade, UniversityConfig } from './types.ts';

/**
 * מחשב ומחיל את הבונוסים האקדמיים על כל מקצוע.
 * @param grades - מערך ציוני הבגרות.
 * @param config - אובייקט הקונפיגורציה של האוניברסיטה.
 * @returns מערך ציונים חדש עם שדה 'bonus' ו-'adjusted_grade' לכל מקצוע.
 */
export function applyAcademicBonuses(grades: SubjectGrade[], config: UniversityConfig) {
  const { bonuses } = config;

  return grades.map(grade => {
    let calculatedBonus = 0;
    if (grade.grade >= bonuses.min_grade_for_bonus) {
      const rule = bonuses.rules.find(r => 
        r.subjects.includes(grade.subject) && r.units === grade.units
      );
      if (rule) {
        calculatedBonus = rule.value;
      }
    }

    const adjustedGrade = bonuses.type === 'additive'
      ? Math.min(100 + calculatedBonus, grade.grade + calculatedBonus) // Some universities allow > 100 before capping
      : grade.grade * (calculatedBonus || 1);

    return { ...grade, bonus: calculatedBonus, adjusted_grade: adjustedGrade };
  });
}

/**
 * מחשב התאמות מיוחדות לאוכלוסיות יעד.
 * **הערה**: הלוגיקה כאן היא Placeholder. יש לממש את התנאים ('condition') מול נתוני המשתמש.
 * @param userProfile - פרופיל המשתמש (כרגע לא בשימוש, לעתיד).
 * @param config - אובייקט הקונפיגורציה של האוניברסיטה.
 * @returns מערך של התאמות ליישום על הציון הסופי.
 */
export function calculateSpecialAdjustments(userProfile: any, config: UniversityConfig) {
  const adjustments = [];
  
  if (config.special_populations_adjustments) {
    for (const adj of config.special_populations_adjustments) {
      // TODO: Implement actual condition evaluation against userProfile
      // For now, we'll assume a placeholder condition is met
      if (adj.population === 'periphery_resident' /* && userProfile.is_periphery */) {
        adjustments.push({
          description: adj.description,
          ...adj.adjustment
        });
      }
    }
  }

  return adjustments;
}