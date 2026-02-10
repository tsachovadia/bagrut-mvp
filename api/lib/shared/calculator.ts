/**
 * Server-side calculation engine
 * Extracted from src/utils/calculator.ts, bonuses.ts, sekem.ts, admission-evaluation.ts
 * Pure functions with zero browser dependencies.
 */

// ============================
// Types
// ============================

export interface SubjectGrade {
    id: string;
    subject: string;
    units: number;
    grade: number;
}

export interface PsychometricScores {
    general: number;
    quantitative: number;
    verbal: number;
    english: number;
    total?: number;
}

export interface SubjectWithBonus extends SubjectGrade {
    adjusted_grade: number;
    bonus: number;
    effectiveUnits?: number;
    isMandatory?: boolean;
}

export interface SekemResult {
    technion: number;
    tau: number;
    bgu: number;
    huji: number;
}

export type Sector = 'mamlachti' | 'mamlachti_dati' | 'arab' | 'druze';

// ============================
// Sector Mandatory Subjects
// ============================

export const SECTOR_MANDATORY_SUBJECTS: Record<Sector, string[]> = {
    mamlachti: ["מתמטיקה", "אנגלית", "עברית - הבעה ולשון", "היסטוריה", "אזרחות", "תנ\"ך", "ספרות"],
    mamlachti_dati: ["מתמטיקה", "אנגלית", "עברית - הבעה ולשון", "היסטוריה", "אזרחות", "תנ\"ך", "תלמוד / תושב״ע", "מחשבת ישראל"],
    arab: ["מתמטיקה", "אנגלית", "עברית לדוברי ערבית", "ערבית לדוברי ערבית", "היסטוריה", "אזרחות", "דת / מורשת (אסלאם/נצרות)", "ספרות"],
    druze: ["מתמטיקה", "אנגלית", "עברית לדוברי ערבית", "ערבית לדוברי ערבית", "היסטוריה", "אזרחות", "מורשת דרוזית", "ספרות"],
};

export const SECTOR_NAMES: Record<Sector, string> = {
    mamlachti: "ממלכתי (יהודי)",
    mamlachti_dati: "ממלכתי-דתי",
    arab: "ערבי",
    druze: "דרוזי",
};

// ============================
// Bonus Calculation
// ============================

export function calculateBonus(subject: string, units: number, grade: number): number {
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
}

// ============================
// Average Calculation
// ============================

function calculateWeightedAverage(subjects: SubjectWithBonus[]): number {
    const totalWeightedGrade = subjects.reduce((sum, s) => sum + (s.adjusted_grade * (s.effectiveUnits || s.units)), 0);
    const totalUnits = subjects.reduce((sum, s) => sum + (s.effectiveUnits || s.units), 0);
    return totalUnits > 0 ? totalWeightedGrade / totalUnits : 0;
}

export function calculateOptimalAverage(
    subjects: SubjectGrade[],
    sector: Sector = 'mamlachti'
): { average: number; subjects_used: SubjectWithBonus[]; subjects_dropped: SubjectWithBonus[] } {
    const minUnits = 20;
    const maxCap = 120;
    const mandatoryList = SECTOR_MANDATORY_SUBJECTS[sector] || SECTOR_MANDATORY_SUBJECTS['mamlachti'];

    // Apply bonuses
    const subjectsWithBonuses: SubjectWithBonus[] = subjects.map(s => {
        const bonus = calculateBonus(s.subject, s.units, s.grade);
        return {
            ...s,
            bonus,
            adjusted_grade: s.grade + bonus,
            effectiveUnits: s.units,
            isMandatory: mandatoryList.includes(s.subject),
        };
    });

    const mandatory = subjectsWithBonuses.filter(s => s.isMandatory);
    let droppable = subjectsWithBonuses
        .filter(s => !s.isMandatory)
        .sort((a, b) => b.adjusted_grade - a.adjusted_grade); // High to low

    let baseCombination = [...mandatory];
    let baseUnits = baseCombination.reduce((sum, s) => sum + s.units, 0);

    // Must add electives until min units reached
    while (baseUnits < minUnits && droppable.length > 0) {
        const next = droppable.shift()!;
        baseCombination.push(next);
        baseUnits += next.units;
    }

    let currentBest = [...baseCombination];
    let currentBestAverage = calculateWeightedAverage(currentBest);
    const dropped: SubjectWithBonus[] = [];

    // Add remaining only if they improve average
    for (const subject of droppable) {
        const nextCombination = [...currentBest, subject];
        const nextAverage = calculateWeightedAverage(nextCombination);
        if (nextAverage > currentBestAverage) {
            currentBestAverage = nextAverage;
            currentBest = nextCombination;
        } else {
            dropped.push(subject);
        }
    }

    return {
        average: Math.min(currentBestAverage, maxCap),
        subjects_used: currentBest,
        subjects_dropped: dropped,
    };
}

// ============================
// Sekem Calculation
// ============================

export function calculateSekem(bagrutAverage: number, psychometricScore: number): SekemResult {
    if (bagrutAverage <= 0 || psychometricScore <= 0) {
        return { technion: 0, tau: 0, bgu: 0, huji: 0 };
    }

    const technion = (0.5 * bagrutAverage) + (0.075 * psychometricScore) - 18;
    const tau = ((bagrutAverage * 4) + psychometricScore) / 2 + 30;
    const bgu = ((bagrutAverage * 3.5) + psychometricScore) / 2 + 50;

    return {
        technion: parseFloat(technion.toFixed(2)),
        tau: parseFloat(tau.toFixed(2)),
        bgu: parseFloat(bgu.toFixed(2)),
        huji: parseFloat(tau.toFixed(2)), // Placeholder same as TAU
    };
}

// ============================
// Sector Detection
// ============================

export function determineSector(grades: SubjectGrade[]): Sector {
    const names = new Set(grades.map(g => g.subject));
    if (names.has('עברית לדוברי ערבית')) {
        if (names.has('מורשת דרוזית')) return 'druze';
        return 'arab';
    }
    if (names.has('תלמוד / תושב״ע') || names.has('מחשבת ישראל')) {
        return 'mamlachti_dati';
    }
    return 'mamlachti';
}

// ============================
// Admission Logic Evaluation
// ============================

export interface LogicCondition {
    type: string;
    operator?: string;
    value?: number | boolean | string;
    subject?: string;
    units?: number;
    label?: string;
}

export interface LogicGroup {
    name?: string;
    AND?: (LogicCondition | LogicGroup)[];
    OR?: (LogicCondition | LogicGroup)[];
    label?: string;
}

export interface AdmissionRequirement {
    id: string;
    program_id: string;
    year: number;
    logic_rules: LogicGroup;
    status: string;
}

export interface UserAdmissionStats {
    bagrutAverage: number;
    bagrutGrades: SubjectGrade[];
    psychometric: PsychometricScores;
    estimatedSekhem: number;
}

export function checkReachable(stats: UserAdmissionStats | undefined, admission?: AdmissionRequirement | null): boolean {
    if (!stats) return false;
    if (!admission || !admission.logic_rules) return true;
    return evaluateLogicGroup(admission.logic_rules, stats);
}

function evaluateLogicGroup(group: LogicGroup, stats: UserAdmissionStats): boolean {
    if (!group.AND && !group.OR) return true;

    if (group.OR && group.OR.length > 0) {
        return group.OR.some(item => evaluateItem(item, stats));
    }

    if (group.AND && group.AND.length > 0) {
        return group.AND.every(item => evaluateItem(item, stats));
    }

    return true;
}

function evaluateItem(item: LogicGroup | LogicCondition, stats: UserAdmissionStats): boolean {
    if ('type' in item) {
        return evaluateCondition(item as LogicCondition, stats);
    }
    return evaluateLogicGroup(item as LogicGroup, stats);
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
        case 'sekhem_eng':
        case 'sekhem':
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
        case 'bagrut_physics': {
            let subjName = subject;
            if (subject === 'math' || type === 'bagrut_math') subjName = 'מתמטיקה';
            if (subject === 'english' || type === 'bagrut_english') subjName = 'אנגלית';
            if (subject === 'physics' || type === 'bagrut_physics') subjName = 'פיסיקה';
            if (subject === 'cs' || subject === 'computer_science') subjName = 'מדעי המחשב';
            if (subjName) {
                const relevant = stats.bagrutGrades.filter(g => g.subject === subjName);
                const valid = condition.units ? relevant.filter(g => g.units >= (condition.units!)) : relevant;
                actualValue = valid.length > 0 ? Math.max(...valid.map(g => g.grade)) : 0;
            }
            break;
        }
        default:
            actualValue = 0;
    }

    switch (operator) {
        case '>=': return actualValue >= numValue;
        case '>': return actualValue > numValue;
        case '<=': return actualValue <= numValue;
        case '<': return actualValue < numValue;
        case '==': return actualValue === numValue;
        default: return actualValue >= numValue;
    }
}

// ============================
// Full Pipeline (like calculation-bridge.ts)
// ============================

export interface BotCalculationResult {
    bagrutAverage: number;
    sekem: SekemResult;
    programResults: {
        programId: string;
        programName: string;
        university: string;
        isReachable: boolean;
        thresholdDisplay: string;
    }[];
}

export function calculateForBot(
    grades: SubjectGrade[],
    psychometric: PsychometricScores,
    sectorOverride?: Sector,
    programs?: { program: { id: string; name: string; institution?: { name: string } }; admission: AdmissionRequirement }[]
): BotCalculationResult {
    if (!grades || grades.length === 0) {
        return { bagrutAverage: 0, sekem: { technion: 0, tau: 0, bgu: 0, huji: 0 }, programResults: [] };
    }

    const sector = sectorOverride || determineSector(grades);
    const optimal = calculateOptimalAverage(grades, sector);
    const psychoTotal = psychometric.total || psychometric.general || 550;
    const sekem = calculateSekem(optimal.average, psychoTotal);

    const userStats: UserAdmissionStats = {
        bagrutAverage: optimal.average,
        bagrutGrades: grades,
        psychometric,
        estimatedSekhem: (optimal.average * 0.5) + (psychoTotal * 0.5),
    };

    const programResults = (programs || []).map(p => {
        const isReachable = checkReachable(userStats, p.admission);

        let thresholdDisplay = "לא צוין";
        if (p.admission?.logic_rules?.OR) {
            const firstRule = p.admission.logic_rules.OR[0];
            if (firstRule && 'AND' in firstRule && firstRule.AND) {
                const sekhemCond = firstRule.AND.find(c => 'type' in c && (c as LogicCondition).type?.startsWith('sekhem')) as LogicCondition | undefined;
                if (sekhemCond?.value) {
                    thresholdDisplay = `${sekhemCond.value}`;
                }
            }
        }

        return {
            programId: p.program.id,
            programName: p.program.name,
            university: p.program.institution?.name || "לא ידוע",
            isReachable,
            thresholdDisplay,
        };
    });

    return { bagrutAverage: optimal.average, sekem, programResults };
}
