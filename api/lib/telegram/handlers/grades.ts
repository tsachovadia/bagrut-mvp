import type { HandlerContext, SubjectGradeBot } from '../types.js';
import { sendMessage, inlineKeyboard, keyboardRow, btn } from '../client.js';
import { updateBotUser, logMessage } from '../middleware.js';
import { setState } from '../services/user-service.js';
import { updateLeadScore } from '../services/lead-scoring.js';

// Subject categories for keyboard display
const SUBJECT_CATEGORIES: { label: string; subjects: { name: string; units: number[] }[] }[] = [
    {
        label: 'חובה',
        subjects: [
            { name: 'מתמטיקה', units: [3, 4, 5] },
            { name: 'אנגלית', units: [3, 4, 5] },
            { name: 'עברית - הבעה ולשון', units: [2] },
            { name: 'היסטוריה', units: [2, 5] },
            { name: 'אזרחות', units: [2, 5] },
            { name: 'תנ"ך', units: [2, 3] },
            { name: 'ספרות', units: [2] },
        ],
    },
    {
        label: 'מדעים',
        subjects: [
            { name: 'פיסיקה', units: [3, 5] },
            { name: 'כימיה', units: [3, 5] },
            { name: 'ביולוגיה', units: [3, 5] },
            { name: 'מדעי המחשב', units: [3, 5] },
        ],
    },
    {
        label: 'חברה/רוח',
        subjects: [
            { name: 'פסיכולוגיה', units: [5] },
            { name: 'סוציולוגיה', units: [5] },
            { name: 'כלכלה', units: [5] },
            { name: 'גיאוגרפיה', units: [3, 5] },
            { name: 'פילוסופיה', units: [3, 5] },
        ],
    },
    {
        label: 'אומנויות/שפות',
        subjects: [
            { name: 'אמנות', units: [3, 5] },
            { name: 'מוסיקה', units: [3, 5] },
            { name: 'תיאטרון', units: [3, 5] },
            { name: 'ערבית', units: [3, 5] },
            { name: 'צרפתית', units: [3, 5] },
        ],
    },
];

// Sector-specific subjects for keyboard
const SECTOR_SUBJECTS: Record<string, { name: string; units: number[] }[]> = {
    mamlachti_dati: [
        { name: 'תלמוד / תושב״ע', units: [3, 5] },
        { name: 'מחשבת ישראל', units: [2, 5] },
    ],
    arab: [
        { name: 'עברית לדוברי ערבית', units: [3, 4, 5] },
        { name: 'ערבית לדוברי ערבית', units: [3, 4, 5] },
    ],
    druze: [
        { name: 'עברית לדוברי ערבית', units: [3, 4, 5] },
        { name: 'ערבית לדוברי ערבית', units: [3, 4, 5] },
        { name: 'מורשת דרוזית', units: [1] },
    ],
};

/**
 * Start grade entry flow - show subject selection keyboard
 */
export async function handleGrades(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;
    const existingCount = Array.isArray(user.grades) ? user.grades.length : 0;

    let header = '📝 <b>הזנת ציוני בגרות</b>\n\n';
    if (existingCount > 0) {
        header += `כבר הזנת ${existingCount} מקצועות.\n`;
        header += 'בחר מקצוע נוסף או לחץ "סיימתי":\n';
    } else {
        header += 'בחר מקצוע להזנה:\n';
    }

    const keyboard = buildSubjectKeyboard(user.sector, 0);

    await sendMessage(chatId, header, { reply_markup: keyboard });
    await setState(user.id, 'grade_entry_subject', { page: 0 });
    await logMessage(user.id, 'outgoing', 'grade_entry_start');
}

/**
 * Handle subject selection callback
 */
export async function handleSubjectSelected(ctx: HandlerContext, subjectName: string): Promise<void> {
    const { chatId, user } = ctx;

    // Find available units for this subject
    const allSubjects = getAllSubjects(user.sector);
    const subjectDef = allSubjects.find(s => s.name === subjectName);
    const units = subjectDef?.units || [3, 4, 5];

    if (units.length === 1) {
        // Only one unit option, skip unit selection
        await setState(user.id, 'grade_entry_score', {
            current_subject: subjectName,
            current_units: units[0],
        });
        await sendMessage(chatId,
            `📝 <b>${subjectName}</b> (${units[0]} יח״ל)\n\nמה הציון שלך? שלח מספר בין 0 ל-100`
        );
    } else {
        // Show unit selection
        await setState(user.id, 'grade_entry_units', {
            current_subject: subjectName,
        });

        const unitButtons = units.map(u => btn(`${u} יח״ל`, `grade_units:${u}`));
        await sendMessage(chatId,
            `📝 <b>${subjectName}</b>\n\nכמה יחידות לימוד?`,
            { reply_markup: inlineKeyboard([unitButtons]) }
        );
    }

    await logMessage(user.id, 'outgoing', 'grade_subject_prompt', subjectName);
}

/**
 * Handle unit selection callback
 */
export async function handleUnitsSelected(ctx: HandlerContext, units: number): Promise<void> {
    const { chatId, user } = ctx;
    const subjectName = user.state_data?.current_subject;

    if (!subjectName) {
        await sendMessage(chatId, 'אירעה שגיאה. שלח /grades כדי להתחיל מחדש.');
        return;
    }

    await setState(user.id, 'grade_entry_score', {
        current_subject: subjectName,
        current_units: units,
    });

    await sendMessage(chatId,
        `📝 <b>${subjectName}</b> (${units} יח״ל)\n\nמה הציון שלך? שלח מספר בין 0 ל-100`
    );
}

/**
 * Handle grade score text input
 */
export async function handleGradeScore(ctx: HandlerContext, scoreText: string): Promise<void> {
    const { chatId, user } = ctx;
    const { current_subject, current_units } = user.state_data || {};

    if (!current_subject || !current_units) {
        await sendMessage(chatId, 'אירעה שגיאה. שלח /grades כדי להתחיל מחדש.');
        return;
    }

    const grade = parseInt(scoreText, 10);
    if (isNaN(grade) || grade < 0 || grade > 100) {
        await sendMessage(chatId, '❌ ציון לא תקין. שלח מספר בין 0 ל-100.');
        return;
    }

    // Add grade to user's grades array
    const currentGrades: SubjectGradeBot[] = Array.isArray(user.grades) ? [...user.grades] : [];

    // Remove existing entry for this subject if exists (update)
    const filtered = currentGrades.filter(g => g.subject !== current_subject);

    const newGrade: SubjectGradeBot = {
        id: `bot_${Date.now()}`,
        subject: current_subject,
        units: current_units,
        grade,
    };

    filtered.push(newGrade);

    await updateBotUser(user.id, {
        grades: filtered,
        conversation_state: 'grade_entry_subject',
        state_data: { page: 0 },
    } as any);

    // Update lead score
    if (filtered.length === 1) {
        await updateLeadScore(user, 'entered_first_grade');
    } else if (filtered.length === 3) {
        await updateLeadScore(user, 'entered_3_grades');
    }

    // Show confirmation and subject grid again
    const keyboard = buildSubjectKeyboard(user.sector, 0);

    await sendMessage(chatId,
        `✅ <b>${current_subject}</b> - ${current_units} יח״ל - ציון <b>${grade}</b>\n\n` +
        `סה״כ: ${filtered.length} מקצועות.\n` +
        `בחר מקצוע נוסף או לחץ "סיימתי":`,
        { reply_markup: keyboard }
    );

    await logMessage(user.id, 'outgoing', 'grade_saved', `${current_subject}: ${grade}`);
}

/**
 * Handle "finished" button
 */
export async function handleGradesDone(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;
    const count = Array.isArray(user.grades) ? user.grades.length : 0;

    await setState(user.id, 'idle', {});

    const hasPsycho = user.psychometric?.general > 0;

    await sendMessage(chatId,
        `📋 הזנת <b>${count}</b> מקצועות.\n\n` +
        `${hasPsycho ? 'מוכן לחישוב!' : 'רוצה להזין גם ציוני פסיכומטרי?'}`,
        {
            reply_markup: inlineKeyboard([
                hasPsycho
                    ? keyboardRow(btn('📊 חשב תוצאות', 'cmd:calculate'))
                    : keyboardRow(btn('🧠 הזן פסיכומטרי', 'cmd:psycho'), btn('📊 חשב בלי פסיכומטרי', 'cmd:calculate')),
                keyboardRow(btn('📝 ערוך ציונים', 'cmd:grades')),
            ]),
        }
    );

    await logMessage(user.id, 'outgoing', 'grades_done', `${count} subjects`);
}

/**
 * Handle page navigation for subject keyboard
 */
export async function handleSubjectPage(ctx: HandlerContext, page: number): Promise<void> {
    const { chatId, user } = ctx;

    const keyboard = buildSubjectKeyboard(user.sector, page);
    const existingCount = Array.isArray(user.grades) ? user.grades.length : 0;

    await sendMessage(chatId,
        `📝 בחר מקצוע:\n(${existingCount} מקצועות מוזנים)`,
        { reply_markup: keyboard }
    );

    await setState(user.id, 'grade_entry_subject', { page });
}

// ============================
// Keyboard builders
// ============================

function getAllSubjects(sector: string | null): { name: string; units: number[] }[] {
    const all: { name: string; units: number[] }[] = [];
    for (const cat of SUBJECT_CATEGORIES) {
        all.push(...cat.subjects);
    }
    if (sector && SECTOR_SUBJECTS[sector]) {
        all.push(...SECTOR_SUBJECTS[sector]);
    }
    return all;
}

function buildSubjectKeyboard(sector: string | null, page: number) {
    const categories = [...SUBJECT_CATEGORIES];

    // Add sector-specific category if applicable
    if (sector && SECTOR_SUBJECTS[sector]) {
        categories.push({ label: 'מגזרי', subjects: SECTOR_SUBJECTS[sector] });
    }

    // Paginate: 2 categories per page
    const perPage = 2;
    const totalPages = Math.ceil(categories.length / perPage);
    const currentPage = Math.min(page, totalPages - 1);
    const pageCategories = categories.slice(currentPage * perPage, (currentPage + 1) * perPage);

    const rows: { text: string; callback_data: string }[][] = [];

    for (const cat of pageCategories) {
        // Category header as a single wide button (non-functional label)
        rows.push([btn(`── ${cat.label} ──`, 'noop')]);

        // Subject buttons, 2 per row
        for (let i = 0; i < cat.subjects.length; i += 2) {
            const row = [btn(cat.subjects[i].name, `grade_subj:${cat.subjects[i].name}`)];
            if (cat.subjects[i + 1]) {
                row.push(btn(cat.subjects[i + 1].name, `grade_subj:${cat.subjects[i + 1].name}`));
            }
            rows.push(row);
        }
    }

    // Navigation + Done
    const navRow: { text: string; callback_data: string }[] = [];
    if (currentPage > 0) navRow.push(btn('◀️ הקודם', `grade_page:${currentPage - 1}`));
    if (currentPage < totalPages - 1) navRow.push(btn('הבא ▶️', `grade_page:${currentPage + 1}`));
    if (navRow.length > 0) rows.push(navRow);

    rows.push([btn('✅ סיימתי להזין ציונים', 'grade_done')]);

    return inlineKeyboard(rows);
}
