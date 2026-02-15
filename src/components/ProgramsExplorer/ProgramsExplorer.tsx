import { useState, useMemo, useEffect } from 'react';
import { useProgramFilters } from '../../hooks/useProgramFilters';
import { Search, Filter, X, Sparkles, ArrowLeft, ChevronDown } from 'lucide-react';
import { Button, Badge } from '../ui/shim';
import { CompactProgramRow } from '../CompactProgramRow';
import { ProgramSummaryPanel } from '../ProgramSummaryPanel';
import { FiltersDrawer } from '../ui/FiltersDrawer';
import { ProgramDetailsDrawer } from '../ui/ProgramDetailsDrawer';
import { admissionEngine } from '../../services/admission-engine';
import { ProgramFilterPanel } from '../ProgramFilterPanel';
import type { UserAdmissionStats } from '../../utils/admission-evaluation';
import { cn } from '../../lib/utils';

interface ProgramsExplorerProps {
    userStats: UserAdmissionStats;
    trackedDegrees: any[];
}

// Popular field keywords for quick-filter chips
const POPULAR_FIELDS = [
    'מדעי המחשב',
    'הנדסת חשמל',
    'רפואה',
    'משפטים',
    'פסיכולוגיה',
    'הנדסת תוכנה',
    'כלכלה',
    'ביולוגיה',
];

export const ProgramsExplorer = ({ userStats, trackedDegrees }: ProgramsExplorerProps) => {
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [selectedInstIds, setSelectedInstIds] = useState<string[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Desktop vs Mobile Filter State
    const [showDesktopFilters, setShowDesktopFilters] = useState(false);
    const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);

    // Details Drawer State
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // University group expand/collapse — all collapsed by default
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // First visit guidance
    const [showGuide, setShowGuide] = useState(() => {
        return !localStorage.getItem('programs_explored');
    });

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const data = await admissionEngine.getAllProgramsFull();
                const mapped = data.map(p => admissionEngine.mapProgramToUI(p));
                setPrograms(mapped);
            } catch (e) {
                console.error("Failed to load programs", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();
    }, []);

    // Filter Logic + search
    const filteredPrograms = useMemo(() => {
        let results = programs;

        // Field filter
        if (selectedFields.length > 0) {
            results = results.filter(item =>
                selectedFields.some(f =>
                    item.program.name?.toLowerCase().includes(f.toLowerCase())
                )
            );
        }

        // Institution filter
        if (selectedInstIds.length > 0) {
            results = results.filter(item =>
                selectedInstIds.includes(item.program.institution?.id)
            );
        }

        // Search query
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            results = results.filter(item =>
                item.program.name?.toLowerCase().includes(q) ||
                item.program.institution?.name?.toLowerCase().includes(q) ||
                item.program.faculty?.name?.toLowerCase().includes(q)
            );
        }

        return results;
    }, [programs, selectedFields, selectedInstIds, searchQuery]);

    const toggleGroup = (instName: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(instName)) next.delete(instName);
            else next.add(instName);
            return next;
        });
    };

    const groupedPrograms = useMemo(() => {
        const groups: Record<string, typeof programs> = {};
        filteredPrograms.forEach(item => {
            const instName = item.program.institution?.name || 'אחר';
            if (!groups[instName]) groups[instName] = [];
            groups[instName].push(item);
        });
        return groups;
    }, [filteredPrograms]);

    const selectedProgramData = useMemo(() => {
        return programs.find(p => p.program.id === selectedProgramId);
    }, [programs, selectedProgramId]);

    // Available quick-filter chips (only show those that exist in data)
    const availableQuickFilters = useMemo(() => {
        return POPULAR_FIELDS.filter(field =>
            programs.some(p => p.program.name?.includes(field))
        );
    }, [programs]);

    const handleFilterUpdate = (fields: string[], instIds: string[]) => {
        setSelectedFields(fields);
        setSelectedInstIds(instIds);
        dismissGuide();
    };

    const handleProgramClick = (id: string) => {
        setSelectedProgramId(id);
        setIsDetailsOpen(true);
    };

    const toggleQuickField = (field: string) => {
        setSelectedFields(prev =>
            prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
        );
        dismissGuide();
    };

    const dismissGuide = () => {
        if (showGuide) {
            setShowGuide(false);
            localStorage.setItem('programs_explored', 'true');
        }
    };

    const hasActiveFilters = selectedFields.length > 0 || selectedInstIds.length > 0 || searchQuery.trim().length > 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-gray-400">טוען תוכניות...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full relative min-h-screen pb-20 bg-gray-50">
            {/* Sticky Header */}
            <div className="sticky top-10 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-2.5">
                    {/* Title Row */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-gray-800">סייר התוכניות</h1>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {filteredPrograms.length} תוצאות
                            </span>
                        </div>

                        {/* Mobile Filter Button */}
                        <div className="lg:hidden">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsFiltersDrawerOpen(true)}
                                className="flex items-center gap-1.5 h-8 px-3 rounded-full border-gray-200 bg-white shadow-sm relative text-xs"
                            >
                                <Filter size={14} className="text-gray-500" />
                                סינון
                                {(selectedFields.length + selectedInstIds.length) > 0 && (
                                    <span className="absolute -top-1 -left-1 bg-indigo-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                        {selectedFields.length + selectedInstIds.length}
                                    </span>
                                )}
                            </Button>
                        </div>

                        {/* Desktop Filter Toggle */}
                        <div className="hidden lg:block">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                                className="flex items-center gap-1.5 h-8 text-xs"
                            >
                                <Filter size={13} />
                                {showDesktopFilters ? 'הסתר מסננים' : 'סינון מתקדם'}
                            </Button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-2">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); dismissGuide(); }}
                            placeholder="חיפוש לפי שם תואר, מוסד או פקולטה..."
                            className="w-full h-9 bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-gray-400"
                            dir="rtl"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Quick Field Chips */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                        {availableQuickFilters.map(field => (
                            <button
                                key={field}
                                onClick={() => toggleQuickField(field)}
                                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                                    selectedFields.includes(field)
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                            >
                                {field}
                            </button>
                        ))}
                        {hasActiveFilters && (
                            <button
                                onClick={() => { handleFilterUpdate([], []); setSearchQuery(''); }}
                                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs text-red-500 hover:text-red-600 font-medium"
                            >
                                <X size={12} /> נקה
                            </button>
                        )}
                    </div>

                    {/* Desktop Filters Panel */}
                    <div className="hidden lg:block">
                        {showDesktopFilters && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200 pt-2 pb-1">
                                <ProgramFilterPanel
                                    selectedFields={selectedFields}
                                    selectedInstitutions={selectedInstIds}
                                    onUpdate={handleFilterUpdate}
                                    variant="explorer"
                                    className="bg-gray-50/50 p-3 rounded-xl border border-gray-200/60"
                                    programs={programs}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* First-Time Guide Banner */}
            {showGuide && !hasActiveFilters && (
                <div className="max-w-7xl mx-auto px-4 pt-4">
                    <div className="bg-gradient-to-l from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 relative">
                        <button onClick={dismissGuide} className="absolute top-3 left-3 text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">מה מעניין אותך?</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    בחר תחום מהרשימה למעלה או חפש תואר ספציפי. נציג לך את כל התוכניות הרלוונטיות עם תנאי הקבלה.
                                </p>
                                <p className="text-xs text-gray-400">
                                    לחץ על תואר כדי לראות פרטים מלאים, סיכויי קבלה, ואפשרות לדבר עם סטודנטים.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-start">

                    {/* Results List */}
                    <div className="col-span-1 lg:col-span-6 space-y-6 order-2 lg:order-1">
                        {Object.entries(groupedPrograms).map(([instName, progs]) => (
                            <section key={instName} className="scroll-mt-32">
                                <button
                                    onClick={() => toggleGroup(instName)}
                                    className="flex items-center gap-2 mb-2 sticky top-[160px] lg:top-[165px] z-10 bg-gray-50/95 backdrop-blur-sm py-1.5 w-full text-right"
                                >
                                    <h2 className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1.5">
                                        <ChevronDown className={cn("w-3 h-3 transition-transform", !expandedGroups.has(instName) && "-rotate-90")} />
                                        {instName} <span className="text-gray-300 mx-0.5">|</span> {progs.length}
                                    </h2>
                                </button>
                                {expandedGroups.has(instName) && (
                                    <div className="space-y-1.5">
                                        {progs.map(({ program, admission }) => (
                                            <CompactProgramRow
                                                key={program.id}
                                                program={program}
                                                admission={admission}
                                                userStats={userStats}
                                                isSelected={selectedProgramId === program.id}
                                                onClick={() => handleProgramClick(program.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}

                        {filteredPrograms.length === 0 && (
                            <div className="text-center py-16 opacity-60">
                                <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-500 mb-2">לא נמצאו תוצאות</p>
                                <Button
                                    variant="link"
                                    className="text-indigo-600 text-sm"
                                    onClick={() => { handleFilterUpdate([], []); setSearchQuery(''); }}
                                >
                                    נקה סינונים
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Summary Panel (Desktop) */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-[170px] h-[calc(100vh-180px)] order-3 lg:order-2">
                        <ProgramSummaryPanel
                            program={selectedProgramData?.program || null}
                            admission={selectedProgramData?.admission || null}
                            userStats={userStats}
                            className="h-full shadow-sm border-gray-200"
                        />
                    </div>
                </div>
            </main>

            {/* Mobile Drawers */}
            <FiltersDrawer
                isOpen={isFiltersDrawerOpen}
                onClose={() => setIsFiltersDrawerOpen(false)}
                selectedFields={selectedFields}
                selectedInstitutions={selectedInstIds}
                onUpdate={handleFilterUpdate}
                programs={programs}
            />

            <ProgramDetailsDrawer
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                program={selectedProgramData?.program || null}
                admission={selectedProgramData?.admission || null}
                userStats={userStats}
            />
        </div>
    );
};
