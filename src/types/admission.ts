export type InstitutionType = 'university' | 'college';

export interface Institution {
    id: string;
    name: string;
    type: InstitutionType;
    logo_url?: string;
    website_url?: string;
    description?: string;
}

export interface Faculty {
    id: string;
    name: string;
}

export interface Program {
    id: string;
    name: string;
    degree_type: string;
    duration_years: number;
    description?: string;
    career_opportunities?: string;
    website_url?: string;
    institution?: Institution;
    faculty?: Faculty;
}

export type LogicOperator = '>=' | '<=' | '==' | '>' | '<';

export interface LogicCondition {
    type: string; // e.g., 'sekhem_quant', 'psychometric_general', 'bagrut_subject'
    operator?: LogicOperator;
    value?: number | boolean | string;
    subject?: string; // for bagrut specific subjects
    units?: number; // for bagrut units
    label?: string; // Human readable label for display
}

export interface LogicGroup {
    name?: string; // Name of this specific path/track (e.g. "Admission by High Sekhem")
    AND?: (LogicCondition | LogicGroup)[];
    OR?: (LogicCondition | LogicGroup)[];
    label?: string;
}

export interface AdmissionRequirement {
    id: string;
    program_id: string;
    year: number;
    logic_rules: LogicGroup;
    raw_text_source?: string;
    status: 'draft' | 'published';
}
