import { admissionEngine, type ExamEvent } from './admission-engine';
import { calculateOptimalAverage, type SubjectGrade } from '../utils/calculator';
import { calculateSekem, type SekemInput } from '../utils/sekem';

export interface Recommendation {
    id: string;
    type: 'bagrut' | 'psychometric';
    subject: string;
    action: string;
    impact_score: number; // 1-10 scale of importance
    predicted_sekem_boost: number;
    next_exam_date?: string;
    next_exam_season?: string;
    description: string;
}

export class SmartRecommendationEngine {

    /**
     * Analyzes the student's current profile and generates actionable recommendations
     * based on the next available exam dates and highest ROI improvements.
     */
    async generateRecommendations(
        grades: SubjectGrade[],
        psychometric: number,
        targetUniversity: 'technion' | 'tau' | 'bgu' | 'general' = 'general'
    ): Promise<Recommendation[]> {

        const recommendations: Recommendation[] = [];
        const baseAvg = calculateOptimalAverage(grades).average;

        // 1. Fetch Exam Schedule (Real Data from DB)
        const schedule = await admissionEngine.getExamSchedule();
        const now = new Date();
        const futureExams = schedule.filter(e => new Date(e.exam_date) > now);

        // 2. Identify High-ROI Subjects (Math, English, Physics)
        // We simulate a +15 point improvement to see the impact
        const subjectsToAnalyze = ['מתמטיקה', 'אנגלית', 'פיזיקה'];

        for (const subjectName of subjectsToAnalyze) {
            const existingSubject = grades.find(g => g.subject === subjectName);

            // Simulation
            let simulatedGrades = [...grades];
            let currentGrade = 0;
            let currentUnits = 0;

            if (existingSubject) {
                // Determine units (default to 5 for simulation if < 4, else keep)
                // Actually, let's assume valid units.
                currentGrade = existingSubject.grade;
                currentUnits = existingSubject.units;

                // If grade is already high, skip
                if (currentGrade >= 95) continue;

                // Simulate Improvement (+15 points or max 100)
                const newGrade = Math.min(100, currentGrade + 15);

                simulatedGrades = grades.map(g =>
                    g.subject === subjectName ? { ...g, grade: newGrade } : g
                );
            } else {
                // If subject doesn't exist, simulate adding it as 5 units / 85 grade
                currentUnits = 5;
                simulatedGrades.push({
                    id: 'temp',
                    subject: subjectName,
                    units: 5,
                    grade: 85
                });
            }

            // Calculate Impact
            const newAvg = calculateOptimalAverage(simulatedGrades).average;
            const avgDiff = newAvg - baseAvg;

            // Rough Sekem Boost Calculation (Linear approx for now)
            // Technion: S = 0.5 * Avg + ... So Delta S = 0.5 * Delta Avg
            const sekemBoost = parseFloat((avgDiff * 0.5).toFixed(2));

            if (sekemBoost > 0.5) {
                // Find next exam date
                const nextExam = this.findNextExam(subjectName, futureExams);

                recommendations.push({
                    id: `rec-${subjectName}`,
                    type: 'bagrut',
                    subject: subjectName,
                    action: `שיפור ${subjectName} ${currentUnits} יח״ל`,
                    impact_score: Math.min(10, Math.ceil(sekemBoost * 2)), // Rough heuristic
                    predicted_sekem_boost: sekemBoost,
                    next_exam_date: nextExam?.exam_date,
                    next_exam_season: nextExam?.season,
                    description: `שיפור ל-${Math.min(100, currentGrade + 15)} יעלה את הממוצע ב-${avgDiff.toFixed(2)} נק׳`
                });
            }
        }

        // 3. Psychometric Opportunity
        const nextPsycho = futureExams.find(e => e.exam_type === 'psychometric');
        if (nextPsycho && psychometric < 740) {
            // Simulate +30 points
            // Technion S = ... + 0.075 * Psycho. 
            // Delta S = 0.075 * 30 = 2.25 points.
            const psychoBoost = 2.25;

            recommendations.push({
                id: 'rec-psycho',
                type: 'psychometric',
                subject: 'פסיכומטרי',
                action: 'שיפור פסיכומטרי',
                impact_score: 8,
                predicted_sekem_boost: psychoBoost,
                next_exam_date: nextPsycho.exam_date,
                next_exam_season: nextPsycho.season,
                description: 'שיפור של 30 נקודות שווה ערך לשיפור משמעותי בממוצע הבגרויות'
            });
        }

        return recommendations.sort((a, b) => b.predicted_sekem_boost - a.predicted_sekem_boost);
    }

    private findNextExam(subject: string, futureExams: ExamEvent[]): ExamEvent | undefined {
        // Simple fuzzy match for now
        return futureExams.find(e =>
            e.exam_type === 'bagrut' &&
            e.subject &&
            subject.includes(e.subject)
        );
    }
}

export const smartRecommendationEngine = new SmartRecommendationEngine();
