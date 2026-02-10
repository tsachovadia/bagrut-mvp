/**
 * Server-side copy of program data from src/data/programs.ts
 * Used by the Telegram bot for calculation and program browsing.
 */

import type { AdmissionRequirement } from './calculator';

interface Institution {
    id: string;
    name: string;
    type: string;
}

interface Faculty {
    id: string;
    name: string;
}

interface Program {
    id: string;
    name: string;
    degree_type: string;
    duration_years: number;
    description?: string;
    career_opportunities?: string;
    institution?: Institution;
    faculty?: Faculty;
    website_url?: string;
}

export interface ProgramEntry {
    program: Program;
    admission: AdmissionRequirement;
}

export const ALL_PROGRAMS: ProgramEntry[] = [
    // --- Ben Gurion ---
    {
        program: { id: 'prog_bgu_cs', name: 'מדעי המחשב', degree_type: 'B.Sc', duration_years: 3, institution: { id: 'inst_bgu', name: 'אוניברסיטת בן-גוריון', type: 'university' }, faculty: { id: 'fac_bgu_nature', name: 'הפקולטה למדעי הטבע' } },
        admission: { id: 'adm_bgu_cs', program_id: 'prog_bgu_cs', year: 2026, status: 'published', logic_rules: { OR: [{ name: "קבלה רגילה", AND: [{ type: "sekhem_quant", operator: ">=", value: 760, label: "סכם כמותי 760+" }] }] } }
    },
    {
        program: { id: 'prog_bgu_ee', name: 'הנדסת חשמל ומחשבים', degree_type: 'B.Sc', duration_years: 4, institution: { id: 'inst_bgu', name: 'אוניברסיטת בן-גוריון', type: 'university' }, faculty: { id: 'fac_bgu_eng', name: 'הפקולטה למדעי ההנדסה' } },
        admission: { id: 'adm_bgu_ee', program_id: 'prog_bgu_ee', year: 2026, status: 'published', logic_rules: { OR: [{ name: "סכם הנדסה", AND: [{ type: "sekhem_eng", operator: ">=", value: 540, label: "סכם הנדסה 540+" }] }] } }
    },
    // --- Tel Aviv University ---
    {
        program: { id: 'prog_tau_cs', name: 'מדעי המחשב', degree_type: 'B.Sc', duration_years: 3, institution: { id: 'inst_tau', name: 'אוניברסיטת תל אביב', type: 'university' }, faculty: { id: 'fac_tau_exact', name: 'הפקולטה למדעים מדויקים' } },
        admission: { id: 'adm_tau_cs', program_id: 'prog_tau_cs', year: 2026, status: 'published', logic_rules: { OR: [{ name: "קבלה רגילה", AND: [{ type: "sekhem", operator: ">=", value: 730, label: "ציון התאמה 730+" }] }] } }
    },
    {
        program: { id: 'prog_tau_med', name: 'רפואה', degree_type: 'MD', duration_years: 7, institution: { id: 'inst_tau', name: 'אוניברסיטת תל אביב', type: 'university' }, faculty: { id: 'fac_tau_med', name: 'הפקולטה לרפואה' } },
        admission: { id: 'adm_tau_med', program_id: 'prog_tau_med', year: 2026, status: 'published', logic_rules: { OR: [{ name: "סכם רפואה", AND: [{ type: "sekhem", operator: ">=", value: 740, label: "ציון התאמה 740+" }, { type: "psychometric", operator: ">=", value: 740, label: "פסיכומטרי 740+" }] }] } }
    },
    // --- Hebrew University ---
    {
        program: { id: 'prog_huji_cs', name: 'הנדסת מחשבים', degree_type: 'B.Sc', duration_years: 4, institution: { id: 'inst_huji', name: 'האוניברסיטה העברית', type: 'university' }, faculty: { id: 'fac_huji_eng', name: 'ביה"ס להנדסה ומדעי המחשב' } },
        admission: { id: 'adm_huji_cs', program_id: 'prog_huji_cs', year: 2026, status: 'published', logic_rules: { OR: [{ name: "קבלה ישירה", AND: [{ type: "psychometric", operator: ">=", value: 740, label: "פסיכומטרי 740+" }] }] } }
    },
    {
        program: { id: 'prog_huji_ppe', name: 'פילוסופיה, כלכלה ומדע המדינה (פכ"מ)', degree_type: 'BA', duration_years: 3, institution: { id: 'inst_huji', name: 'האוניברסיטה העברית', type: 'university' }, faculty: { id: 'fac_huji_soc', name: 'הפקולטה למדעי החברה' } },
        admission: { id: 'adm_huji_ppe', program_id: 'prog_huji_ppe', year: 2026, status: 'published', logic_rules: { OR: [{ name: "קבלה משוקללת", AND: [{ type: "sekhem", operator: ">=", value: 24, label: "בגרות ופסיכומטרי (סכם מיוחד)" }] }] } }
    },
    // --- Technion ---
    {
        program: { id: 'prog_tech_cs', name: 'מדעי המחשב', degree_type: 'B.Sc', duration_years: 3, institution: { id: 'inst_tech', name: 'הטכניון', type: 'university' }, faculty: { id: 'fac_tech_cs', name: 'הפקולטה למדעי המחשב' } },
        admission: { id: 'adm_tech_cs', program_id: 'prog_tech_cs', year: 2026, status: 'published', logic_rules: { OR: [{ name: "סכם טכניון", AND: [{ type: "sekhem", operator: ">=", value: 92, label: "סכם 92+" }] }] } }
    },
    {
        program: { id: 'prog_tech_arch', name: 'אדריכלות', degree_type: 'B.Arch', duration_years: 5, institution: { id: 'inst_tech', name: 'הטכניון', type: 'university' }, faculty: { id: 'fac_tech_arch', name: 'הפקולטה לארכיטקטורה' } },
        admission: { id: 'adm_tech_arch', program_id: 'prog_tech_arch', year: 2026, status: 'published', logic_rules: { OR: [{ name: "סכם + בחינת מיון", AND: [{ type: "sekhem", operator: ">=", value: 87, label: "סכם 87+" }, { type: "exam_arch", operator: ">=", value: 1, label: "מעבר בחינת מיון" }] }] } }
    },
    // --- Bar Ilan ---
    {
        program: { id: 'prog_biu_llb', name: 'משפטים', degree_type: 'LL.B', duration_years: 3.5, institution: { id: 'inst_biu', name: 'אוניברסיטת בר אילן', type: 'university' }, faculty: { id: 'fac_biu_law', name: 'הפקולטה למשפטים' } },
        admission: { id: 'adm_biu_llb', program_id: 'prog_biu_llb', year: 2026, status: 'published', logic_rules: { OR: [{ name: "ממוצע בגרות", AND: [{ type: "bagrut_avg", operator: ">=", value: 105, label: "ממוצע בגרות 105+" }] }] } }
    },
    // --- Reichman ---
    {
        program: { id: 'prog_idc_business', name: 'מנהל עסקים', degree_type: 'BA', duration_years: 3, institution: { id: 'inst_reichman', name: 'אוניברסיטת רייכמן', type: 'university' }, faculty: { id: 'fac_idc_bus', name: 'ביה"ס למנהל עסקים' } },
        admission: { id: 'adm_idc_bus', program_id: 'prog_idc_business', year: 2026, status: 'published', logic_rules: { OR: [{ name: "ממוצע בגרות + ראיון", AND: [{ type: "bagrut_avg_weighted", operator: ">=", value: 100, label: "בגרות משוקללת 100+" }] }] } }
    },
    // --- University of Haifa ---
    {
        program: { id: 'prog_haifa_psych', name: 'פסיכולוגיה', degree_type: 'BA', duration_years: 3, institution: { id: 'inst_haifa', name: 'אוניברסיטת חיפה', type: 'university' }, faculty: { id: 'fac_haifa_soc', name: 'הפקולטה למדעי החברה' } },
        admission: { id: 'adm_haifa_psych', program_id: 'prog_haifa_psych', year: 2026, status: 'published', logic_rules: { OR: [{ name: "חתך קבלה", AND: [{ type: "sekhem", operator: ">=", value: 680, label: "סכם 680+" }] }] } }
    },
    // --- Ariel ---
    {
        program: { id: 'prog_ariel_civil', name: 'הנדסה אזרחית', degree_type: 'B.Sc', duration_years: 4, institution: { id: 'inst_ariel', name: 'אוניברסיטת אריאל', type: 'university' }, faculty: { id: 'fac_ariel_eng', name: 'הפקולטה להנדסה' } },
        admission: { id: 'adm_ariel_civil', program_id: 'prog_ariel_civil', year: 2026, status: 'published', logic_rules: { OR: [{ name: "בגרות ופסיכומטרי", AND: [{ type: "psychometric", operator: ">=", value: 580, label: "פסיכומטרי 580+" }, { type: "math_bagrut", operator: ">=", value: 4, label: "מתמטיקה 4 יח״ל" }] }] } }
    },
    // --- Open University ---
    {
        program: { id: 'prog_open_psych', name: 'פסיכולוגיה', degree_type: 'BA', duration_years: 3, institution: { id: 'inst_open', name: 'האוניברסיטה הפתוחה', type: 'university' }, faculty: { id: 'fac_open_soc', name: 'מדעי החברה והרוח' } },
        admission: { id: 'adm_open_psych', program_id: 'prog_open_psych', year: 2026, status: 'published', logic_rules: { OR: [{ name: "קבלה פתוחה", AND: [], label: "ללא תנאי קבלה מוקדמים" }] } }
    },
];

// Utility: Get unique fields (derived from program names / common categories)
export const PROGRAM_FIELDS = [
    { id: 'cs', label: 'מדעי המחשב', keywords: ['מדעי המחשב', 'הנדסת מחשבים', 'הנדסת תוכנה'] },
    { id: 'engineering', label: 'הנדסה', keywords: ['הנדסת חשמל', 'הנדסה אזרחית', 'אדריכלות'] },
    { id: 'medicine', label: 'רפואה', keywords: ['רפואה'] },
    { id: 'law', label: 'משפטים', keywords: ['משפטים'] },
    { id: 'psychology', label: 'פסיכולוגיה', keywords: ['פסיכולוגיה'] },
    { id: 'business', label: 'מנהל עסקים', keywords: ['מנהל עסקים'] },
    { id: 'social', label: 'חברה ורוח', keywords: ['פילוסופיה', 'כלכלה', 'מדע המדינה'] },
];

export function getProgramsByField(fieldId: string): ProgramEntry[] {
    const field = PROGRAM_FIELDS.find(f => f.id === fieldId);
    if (!field) return [];
    return ALL_PROGRAMS.filter(p =>
        field.keywords.some(kw => p.program.name.includes(kw))
    );
}

export function getProgramById(id: string): ProgramEntry | undefined {
    return ALL_PROGRAMS.find(p => p.program.id === id);
}
