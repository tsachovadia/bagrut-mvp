import { useState, useMemo, useEffect } from 'react';
import { useProgramFilters } from '../../hooks/useProgramFilters';
import { Search, Filter, Building2 } from 'lucide-react';
import { Button, Badge } from '../ui/shim';
import { CompactProgramRow } from '../CompactProgramRow';
import { ProgramSummaryPanel } from '../ProgramSummaryPanel';
import { useNavigate } from 'react-router-dom';
import { admissionEngine } from '../../services/admission-engine';
import { ProgramFilterPanel } from '../ProgramFilterPanel';
import { TrackedDegreesWidget } from '../TrackedDegreesWidget';
import type { UserAdmissionStats } from '../../utils/admission-evaluation';

interface ProgramsExplorerProps {
    userStats: UserAdmissionStats;
    trackedDegrees: any[];
}

export const ProgramsExplorer = ({ userStats, trackedDegrees }: ProgramsExplorerProps) => {
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [selectedInstIds, setSelectedInstIds] = useState<string[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(true);
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
    const navigate = useNavigate();

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

    // Filter Logic (Consolidated via Hook)
    const filteredPrograms = useProgramFilters(programs, {
        fields: selectedFields,
        institutionIds: selectedInstIds,
        isUndecided: false, // Explorer always filters explicitly
        searchQuery: ''
    }, {
        getField: (item: any) => item.program.name,
        getInstitutionId: (item: any) => item.program.institution?.id,
        getInstitutionName: (item: any) => item.program.institution?.name
    });

    // Auto-select first program on load/filter change if none selected
    useEffect(() => {
        if (!selectedProgramId && filteredPrograms.length > 0) {
            setSelectedProgramId(filteredPrograms[0].program.id);
        }
    }, [filteredPrograms, selectedProgramId]);

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

    const handleFilterUpdate = (fields: string[], instIds: string[]) => {
        setSelectedFields(fields);
        setSelectedInstIds(instIds);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full relative min-h-screen pb-20 bg-gray-50">
            {/* Header / Filters Section */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-gray-800">סייר התוכניות</h1>
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                                {filteredPrograms.length} תוצאות
                            </Badge>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 h-9 text-xs"
                        >
                            <Filter size={14} />
                            {showFilters ? 'הסתר מסננים' : 'סינון מתקדם'}
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200 pb-2">
                            <ProgramFilterPanel
                                selectedFields={selectedFields}
                                selectedInstitutions={selectedInstIds}
                                onUpdate={handleFilterUpdate}
                                variant="explorer"
                                className="bg-gray-50/50 p-4 rounded-xl border border-gray-200/60"
                                programs={programs}
                            />
                        </div>
                    )}

                    {/* Active Filters Summary (when collapsed) */}
                    {!showFilters && (selectedFields.length > 0 || selectedInstIds.length > 0) && (
                        <div className="flex gap-2 pb-1 overflow-x-auto text-xs">
                            {selectedFields.map(f => <Badge key={f} variant="secondary" className="px-2 py-0.5">{f}</Badge>)}
                            {selectedInstIds.length > 0 && <Badge variant="outline" className="px-2 py-0.5">{selectedInstIds.length} מוסדות</Badge>}
                        </div>
                    )}
                </div>
            </div>

            {/* Split Layout */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

                    {/* Right Panel (RTL): Results List - 6 Cols */}
                    <div className="col-span-1 lg:col-span-6 space-y-8 order-2 lg:order-1">
                        {Object.entries(groupedPrograms).map(([instName, progs]) => (
                            <section key={instName} className="scroll-mt-32">
                                {/* Section Header */}
                                <div className="flex items-center gap-2 mb-3 sticky top-[138px] z-10 bg-gray-50/95 backdrop-blur-sm py-2">
                                    <h2 className="text-sm font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
                                        {instName} <span className="text-gray-300 mx-1">|</span> {progs.length}
                                    </h2>
                                </div>

                                {/* Stacked List */}
                                <div className="space-y-2">
                                    {progs.map(({ program, admission }) => (
                                        <CompactProgramRow
                                            key={program.id}
                                            program={program}
                                            admission={admission}
                                            userStats={userStats}
                                            isSelected={selectedProgramId === program.id}
                                            onClick={() => setSelectedProgramId(program.id)}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}

                        {filteredPrograms.length === 0 && (
                            <div className="text-center py-20 opacity-60">
                                <Search className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-500">לא נמצאו תוצאות לחיפוש זה</p>
                                <Button
                                    variant="link"
                                    className="text-blue-600 text-sm"
                                    onClick={() => handleFilterUpdate([], [])}
                                >
                                    נקה סינונים
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Middle Panel: Summary - 4 Cols */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-[140px] h-[calc(100vh-150px)] order-3 lg:order-2">
                        <ProgramSummaryPanel
                            program={selectedProgramData?.program || null}
                            admission={selectedProgramData?.admission || null}
                            userStats={userStats}
                            className="h-full shadow-sm border-gray-200"
                        />
                    </div>

                    {/* Left Panel (RTL): Tracked Degrees - 2 Cols */}
                    <div className="hidden lg:block lg:col-span-2 sticky top-[140px] max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar order-1 lg:order-3">
                        <TrackedDegreesWidget
                            availablePrograms={programs}
                            className="shadow-sm border-gray-200"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};
