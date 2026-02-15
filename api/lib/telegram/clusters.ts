export type ClusterId = 'tech' | 'med' | 'law' | 'mind' | 'business' | 'design';

export const PROGRAM_CLUSTER_MAP: Record<string, ClusterId> = {
    // Tech & Engineering
    'prog_bgu_cs': 'tech',
    'prog_bgu_ee': 'tech',
    'prog_tau_cs': 'tech',
    'prog_huji_cs': 'tech',
    'prog_tech_cs': 'tech',
    'prog_ariel_civil': 'tech', // Civil Engineering -> Tech

    // Medicine & Health
    'prog_tau_med': 'med',

    // Law & Government
    'prog_biu_llb': 'law',
    'prog_huji_ppe': 'law',

    // Mind & Society
    'prog_haifa_psych': 'mind',
    'prog_open_psych': 'mind',

    // Business & Management
    'prog_idc_business': 'business',

    // Design & Architecture
    'prog_tech_arch': 'design'
};

export const CLUSTER_NAMES: Record<ClusterId, string> = {
    'tech': 'הייטק והנדסה',
    'med': 'רפואה ובריאות',
    'law': 'משפטים וממשל',
    'mind': 'נפש וחברה',
    'business': 'ניהול ועסקים',
    'design': 'עיצוב ואדריכלות'
};

export function getClusterByProgramId(programId: string): ClusterId | null {
    return PROGRAM_CLUSTER_MAP[programId] || null;
}
