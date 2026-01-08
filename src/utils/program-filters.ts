import { ALL_PROGRAMS } from '../data/programs';

export interface FilterOptions {
    fields: string[];
    institutions: { id: string; name: string; logo?: string }[];
}

export const getProgramFilterOptions = (): FilterOptions => {
    const uniqueFields = Array.from(new Set(ALL_PROGRAMS.map(p => p.program.name))).sort();

    const uniqueInstitutionsMap = new Map<string, { id: string; name: string; logo?: string }>();

    ALL_PROGRAMS.forEach(p => {
        const inst = p.program.institution;
        if (inst && inst.id && !uniqueInstitutionsMap.has(inst.id)) {
            uniqueInstitutionsMap.set(inst.id, {
                id: inst.id,
                name: inst.name,
                logo: inst.logo_url
            });
        }
    });

    const institutions = Array.from(uniqueInstitutionsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return {
        fields: uniqueFields,
        institutions
    };
};
