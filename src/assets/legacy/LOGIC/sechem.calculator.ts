// supabase/functions/_shared/core-logic/sechem.calculator.ts
import type { PsychometricScores, UniversityConfig } from './types.ts';

/**
 * מחשב את ציוני הסכם/התאמה עבור אוניברסיטה נתונה.
 * @param optimalAverage - ממוצע הבגרות האופטימלי.
 * @param psychometric - ציוני הפסיכומטרי.
 * @param config - אובייקט הקונפיגורציה של האוניברסיטה.
 * @returns מערך של ציונים מחושבים (יכול להיות יותר מאחד, כמו בבן-גוריון).
 */
export function calculateSechem(optimalAverage: number, psychometric: PsychometricScores, config: UniversityConfig) {
  return config.sechem_formulas.map(formula => {
    let score = 0;
    let explanation = "שגיאה בחישוב";

    switch (formula.calculation_method) {
      case 'tau_complex':
        const { matriculation_multiplier, matriculation_subtractor, final_multiplier, final_subtractor } = formula.params;
        score = ((optimalAverage * matriculation_multiplier) - matriculation_subtractor + psychometric.general) * final_multiplier - final_subtractor;
        explanation = `((ממוצע(${optimalAverage.toFixed(2)}) * ${matriculation_multiplier}) - ${matriculation_subtractor} + פסיכו(${psychometric.general})) * ${final_multiplier} - ${final_subtractor}`;
        break;

      case 'technion_sechem':
        const { matriculation_weight, psychometric_weight, constant_subtractor } = formula.params;
        score = (optimalAverage * matriculation_weight) + (psychometric.general * psychometric_weight) - constant_subtractor;
        explanation = `(ממוצע(${optimalAverage.toFixed(2)}) * ${matriculation_weight}) + (פסיכו(${psychometric.general}) * ${psychometric_weight}) - ${constant_subtractor}`;
        break;
      
      case 'bgu_engineering':
        // TODO: Implement complex BGU engineering logic based on presence of physics
        score = 500; // Placeholder
        explanation = "נוסחת הנדסה מורכבת של בן-גוריון (Placeholder)";
        break;

      case 'weighted_average':
        const psychoComponent = formula.params.psychometric_component === 'quantitative' && psychometric.quantitative
          ? psychometric.quantitative
          : psychometric.general;
        score = (optimalAverage * formula.params.bagrut_weight) + (psychoComponent * formula.params.psychometric_weight);
        explanation = `(ממוצע(${optimalAverage.toFixed(2)}) * ${formula.params.bagrut_weight}) + (פסיכו(${psychoComponent}) * ${formula.params.psychometric_weight})`;
        break;
    }
    
    return {
      type: formula.type,
      name: formula.name,
      score: Math.round(score * 10) / 10,
      explanation
    };
  });
}