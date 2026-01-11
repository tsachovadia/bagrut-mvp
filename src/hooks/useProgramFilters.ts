import { useMemo } from 'react';

interface FilterConfig<T> {
    getField: (item: T) => string;        // Accessor for the degree name/field string
    getInstitutionId: (item: T) => string | undefined; // Accessor for institution ID
    getInstitutionName?: (item: T) => string; // Optional: Accessor for institution Name (fallback or text search)
}

interface FilterState {
    fields: string[];
    institutionIds: string[];
    isUndecided: boolean;
    searchQuery?: string;
}

/**
 * A shared hook to filter programs or degrees uniformly across the app.
 * Used by: ProgramsExplorer, TargetsPanel (Sidebar).
 */
export function useProgramFilters<T>(
    items: T[],
    filters: FilterState,
    config: FilterConfig<T>
) {
    return useMemo(() => {
        // If "Undecided" is checked, we generally show everything (or maybe specific recommendations),
        // but current UI behavior in TargetsPanel effectively ignores filters if undecided.
        // However, usually we might still want to allow search.
        // Let's stick to the granular logic:

        return items.filter(item => {
            const itemName = config.getField(item) || '';
            const itemInstId = config.getInstitutionId(item);
            const itemInstName = config.getInstitutionName ? config.getInstitutionName(item) : '';

            // 1. Text Search (if exists)
            if (filters.searchQuery) {
                const q = filters.searchQuery.toLowerCase();
                const matchesName = itemName.toLowerCase().includes(q);
                const matchesInst = itemInstName.toLowerCase().includes(q);
                if (!matchesName && !matchesInst) return false;
            }

            // 2. Undecided Override
            // If user is truly undecided and hasn't selected filters, we might show all.
            // But if they HAVE selected filters, we usually respect them even if "isUndecided" flag is technicaly true
            // (The UI usually clears isUndecided on interaction, but let's be safe).
            // Actually, existing logic says: if undecided, return true.
            if (filters.isUndecided && filters.fields.length === 0 && filters.institutionIds.length === 0 && !filters.searchQuery) {
                return true;
            }

            // 3. Field Filter (OR logic between selected fields)
            // Does the item name contain ONE of the selected tags?
            const matchesField = filters.fields.length === 0 || filters.fields.some(field =>
                itemName.includes(field) // Simple inclusion check, consistent with ProgramsExplorer
            );

            // 4. Institution Filter (OR logic between selected ids)
            const matchesInstitution = filters.institutionIds.length === 0 || (
                itemInstId && filters.institutionIds.includes(itemInstId)
            );

            return matchesField && matchesInstitution;
        });
    }, [items, filters, config]);
}
