import type { AdmissionRequirement, LogicGroup, LogicCondition } from '../types/admission';
import type { SubjectGrade, PsychometricScores } from './calculator';

export interface UserAdmissionStats {
    bagrutAverage: number;
    bagrutGrades: SubjectGrade[];
    psychometric: PsychometricScores;
    estimatedSekhem: number;
}

export function checkReachable(stats: UserAdmissionStats | undefined, admission?: AdmissionRequirement | null): boolean {
    if (!stats) return false; // No stats means we can't check
    if (!admission || !admission.logic_rules) return true; // No rules means accessible (or unknown)

    return evaluateLogicGroup(admission.logic_rules, stats);
}

function evaluateLogicGroup(group: LogicGroup, stats: UserAdmissionStats): boolean {
    // If empty group, it's effectively "Open Admission" or "No specific rules"
    if (!group.AND && !group.OR) return true;

    // OR logic: One of the paths must be true
    if (group.OR && group.OR.length > 0) {
        return group.OR.some(item => evaluateItem(item, stats));
    }

    // AND logic: All conditions must be true
    if (group.AND && group.AND.length > 0) {
        return group.AND.every(item => evaluateItem(item, stats));
    }

    return true;
}

function evaluateItem(item: LogicGroup | LogicCondition, stats: UserAdmissionStats): boolean {
    if ('type' in item) {
        return evaluateCondition(item as LogicCondition, stats);
    } else {
        return evaluateLogicGroup(item as LogicGroup, stats);
    }
}

function evaluateCondition(condition: LogicCondition, stats: UserAdmissionStats): boolean {
    const { type, operator, value, subject } = condition;
    const numValue = Number(value);

    let actualValue = 0;

    switch (type) {
        case 'sekhem_general':
        case 'sekhem_quant':
        case 'sekhem_engineering':
        case 'sekhem_technion':
        case 'sekhem_huji':
        case 'sekhem_bgu':
            // For MVP, we use the single estimatedSekhem. 
            // TODO: detailed university-specific formulas
            actualValue = stats.estimatedSekhem;
            break;
        case 'bagrut_average':
            actualValue = stats.bagrutAverage;
            break;
        case 'psychometric_general':
            actualValue = stats.psychometric.general || 0;
            break;
        case 'psychometric_quant':
            actualValue = stats.psychometric.quantitative || 0;
            break;
        case 'psychometric_verbal':
            actualValue = stats.psychometric.verbal || 0;
            break;
        case 'psychometric_english':
            actualValue = stats.psychometric.english || 0;
            break;
        case 'bagrut_subject':
        case 'bagrut_math':
        case 'bagrut_english':
        case 'bagrut_physics':
            let subjName = subject;
            // Map common English keys to Hebrew names
            if (subject === 'math' || type === 'bagrut_math') subjName = 'מתמטיקה';
            if (subject === 'english' || type === 'bagrut_english') subjName = 'אנגלית';
            if (subject === 'physics' || type === 'bagrut_physics') subjName = 'פיזיקה';
            if (subject === 'cs' || subject === 'computer_science') subjName = 'מדעי המחשב';

            if (subjName) {
                actualValue = getSubjectGrade(stats.bagrutGrades, subjName, condition.units);
            }
            break;
        default:
            // Unknown type
            actualValue = 0;
            break;
    }

    switch (operator) {
        case '>=': return actualValue >= numValue;
        case '>': return actualValue > numValue;
        case '<=': return actualValue <= numValue;
        case '<': return actualValue < numValue;
        case '==': return actualValue === numValue;
        default: return actualValue >= numValue; // Default to >=
    }
}

function getSubjectGrade(grades: SubjectGrade[], subjectName: string, minUnits?: number): number {
    const relevant = grades.filter(g => g.subject === subjectName);
    if (relevant.length === 0) return 0;

    // Find valid entries (match min units if specified)
    const valid = minUnits ? relevant.filter(g => g.units >= minUnits) : relevant;

    if (valid.length === 0) return 0;

    // Return max grade
    return Math.max(...valid.map(g => g.grade));
}
