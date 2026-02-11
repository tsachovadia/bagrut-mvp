import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- Types ---

interface SubjectGrade {
    id: string;
    subject: string;
    units: number;
    grade: number;
}

interface PsychometricScores {
    general: number;
    quantitative: number;
    verbal: number;
    english: number;
}

interface GapItem {
    type: 'sekhem' | 'psychometric' | 'bagrut_subject' | 'bagrut_average' | 'psychometric_component';
    field: string;
    current: number;
    required: number;
    deficit: number;
    suggestion: string;
}

export interface ProgramGapResult {
    program_id: string;
    program_name: string;
    institution: string;
    status: 'admitted' | 'close' | 'far';
    gaps: GapItem[];
}

interface LogicCondition {
    type: string;
    operator?: string;
    value?: number | boolean | string;
    subject?: string;
    units?: number;
    label?: string;
}

interface LogicGroup {
    AND?: (LogicCondition | LogicGroup)[];
    OR?: (LogicCondition | LogicGroup)[];
}

// --- Core Logic ---

/**
 * Analyze gaps between student profile and program requirements.
 * Inverts the admission-evaluation logic: instead of "pass/fail",
 * returns "what's missing and by how much".
 */
export function analyzeGaps(
    bagrutAverage: number,
    bagrutGrades: SubjectGrade[],
    psychometric: PsychometricScores,
    estimatedSekhem: number,
    logicRules: LogicGroup,
    programName: string,
    institutionName: string,
    programId: string
): ProgramGapResult {
    const gaps: GapItem[] = [];

    // Collect all conditions from the logic tree
    const conditions = flattenConditions(logicRules);

    for (const cond of conditions) {
        const gap = evaluateGap(cond, bagrutAverage, bagrutGrades, psychometric, estimatedSekhem);
        if (gap) {
            gaps.push(gap);
        }
    }

    // Determine status based on gaps
    let status: 'admitted' | 'close' | 'far';
    if (gaps.length === 0) {
        status = 'admitted';
    } else {
        // Calculate relative deficit: if any gap is >20% of requirement, it's "far"
        const maxRelativeDeficit = Math.max(
            ...gaps.map(g => g.required > 0 ? g.deficit / g.required : 0)
        );
        status = maxRelativeDeficit > 0.15 ? 'far' : 'close';
    }

    return {
        program_id: programId,
        program_name: programName,
        institution: institutionName,
        status,
        gaps,
    };
}

/**
 * Flatten a logic tree into a list of the "best path" conditions.
 * For OR groups, picks the path with the fewest/smallest gaps.
 * For AND groups, collects all conditions.
 */
function flattenConditions(group: LogicGroup): LogicCondition[] {
    if (!group.AND && !group.OR) return [];

    if (group.AND) {
        const conditions: LogicCondition[] = [];
        for (const item of group.AND) {
            if ('type' in item) {
                conditions.push(item as LogicCondition);
            } else {
                conditions.push(...flattenConditions(item as LogicGroup));
            }
        }
        return conditions;
    }

    if (group.OR && group.OR.length > 0) {
        // For OR, return conditions from the first path (simplest heuristic)
        const firstPath = group.OR[0];
        if ('type' in firstPath) {
            return [firstPath as LogicCondition];
        }
        return flattenConditions(firstPath as LogicGroup);
    }

    return [];
}

function evaluateGap(
    condition: LogicCondition,
    bagrutAverage: number,
    bagrutGrades: SubjectGrade[],
    psychometric: PsychometricScores,
    estimatedSekhem: number
): GapItem | null {
    const required = Number(condition.value);
    if (isNaN(required)) return null;

    let current = 0;
    let type: GapItem['type'] = 'sekhem';
    let field = condition.type;

    switch (condition.type) {
        case 'sekhem_general':
        case 'sekhem_quant':
        case 'sekhem_engineering':
        case 'sekhem_technion':
        case 'sekhem_huji':
        case 'sekhem_bgu':
            current = estimatedSekhem;
            type = 'sekhem';
            field = 'sekם';
            break;

        case 'bagrut_average':
            current = bagrutAverage;
            type = 'bagrut_average';
            field = 'ממוצע בגרות';
            break;

        case 'psychometric_general':
            current = psychometric.general || 0;
            type = 'psychometric';
            field = 'פסיכומטרי כללי';
            break;

        case 'psychometric_quant':
            current = psychometric.quantitative || 0;
            type = 'psychometric_component';
            field = 'פסיכומטרי כמותי';
            break;

        case 'psychometric_verbal':
            current = psychometric.verbal || 0;
            type = 'psychometric_component';
            field = 'פסיכומטרי מילולי';
            break;

        case 'psychometric_english':
            current = psychometric.english || 0;
            type = 'psychometric_component';
            field = 'פסיכומטרי אנגלית';
            break;

        case 'bagrut_subject':
        case 'bagrut_math':
        case 'bagrut_english':
        case 'bagrut_physics': {
            let subjName = condition.subject;
            if (condition.subject === 'math' || condition.type === 'bagrut_math') subjName = 'מתמטיקה';
            if (condition.subject === 'english' || condition.type === 'bagrut_english') subjName = 'אנגלית';
            if (condition.subject === 'physics' || condition.type === 'bagrut_physics') subjName = 'פיזיקה';

            type = 'bagrut_subject';
            field = subjName || condition.type;

            const relevant = bagrutGrades.filter(g => g.subject === subjName);
            const minUnits = condition.units;
            const valid = minUnits
                ? relevant.filter(g => g.units >= minUnits)
                : relevant;
            current = valid.length > 0 ? Math.max(...valid.map(g => g.grade)) : 0;
            break;
        }

        default:
            return null;
    }

    const deficit = required - current;
    if (deficit <= 0) return null; // No gap

    const suggestion = generateSuggestion(type, field, deficit, current, required);

    return { type, field, current, required, deficit, suggestion };
}

function generateSuggestion(
    type: GapItem['type'],
    field: string,
    deficit: number,
    current: number,
    required: number
): string {
    switch (type) {
        case 'psychometric':
        case 'psychometric_component':
            return `צריך לשפר ${field} ב-${deficit} נקודות (מ-${current} ל-${required}). שקול קורס הכנה לפסיכומטרי.`;
        case 'bagrut_average':
            return `ממוצע הבגרות שלך ${current.toFixed(1)}, צריך ${required}. שקול שיפור בגרויות.`;
        case 'bagrut_subject':
            if (current === 0) {
                return `חסר ציון ב${field}. צריך ציון ${required} לפחות.`;
            }
            return `ציון ב${field}: ${current}, צריך ${required}. שקול שיפור.`;
        case 'sekhem':
            return `הסכם שלך ${current.toFixed(1)}, צריך ${required}. שיפור בגרות או פסיכומטרי יעזור.`;
        default:
            return `חסר ${deficit} נקודות ב${field}.`;
    }
}

/**
 * Compute and store gap analysis for a user profile.
 */
export async function computeAndStoreGaps(
    userId: string,
    bagrutAverage: number,
    bagrutGrades: SubjectGrade[],
    psychometric: PsychometricScores,
    estimatedSekhem: number,
    trackedPrograms: string[]
): Promise<ProgramGapResult[]> {
    if (trackedPrograms.length === 0) return [];

    // Fetch admission rules for tracked programs
    const { data: programs } = await supabase
        .from('programs')
        .select(`
            id, name,
            faculties ( name, institutions ( name ) ),
            admission_rules ( logic_config, raw_json )
        `)
        .in('id', trackedPrograms);

    if (!programs || programs.length === 0) return [];

    const results: ProgramGapResult[] = [];

    for (const prog of programs) {
        const faculty = prog.faculties as any;
        const institutionName = faculty?.institutions?.name || 'לא ידוע';
        const rule = (prog.admission_rules as any[])?.[0];
        const logicRules = rule?.logic_config || rule?.raw_json || {};

        const result = analyzeGaps(
            bagrutAverage,
            bagrutGrades,
            psychometric,
            estimatedSekhem,
            logicRules,
            prog.name,
            institutionName,
            prog.id
        );
        results.push(result);
    }

    // Store in user_profiles
    await supabase
        .from('user_profiles')
        .update({ gap_analysis: results })
        .eq('id', userId);

    return results;
}
