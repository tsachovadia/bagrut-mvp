import { ALL_PROGRAMS } from '../data/programs';

export interface FilterOptions {
    fields: string[];
    institutions: { id: string; name: string; logo?: string }[];
}

// Now accepts optional 'programs' to derive filters from live data
export const getProgramFilterOptions = (programs?: any[]): FilterOptions => {
    const sourceData = programs && programs.length > 0 ? programs : ALL_PROGRAMS;

    // Extract Fields (using 'name' as proxy for now, ideally 'tags')
    const uniqueFields = Array.from(new Set(sourceData.map(p => p.program.name))).sort();

    const uniqueInstitutionsMap = new Map<string, { id: string; name: string; logo?: string }>();

    sourceData.forEach(p => {
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
