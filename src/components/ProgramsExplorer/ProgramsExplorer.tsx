import { useState, useMemo } from 'react';
import { Search, BookOpen, GraduationCap, Building2, CheckCircle2, ChevronDown, List, Grid, X } from 'lucide-react';
import { Button, Input, Badge } from '../ui/shim';
import { CompactProgramCard } from '../CompactProgramCard';
import { useNavigate } from 'react-router-dom';
import { ALL_PROGRAMS } from '../../data/programs';
import type { UserAdmissionStats } from '../../utils/admission-evaluation';

interface ProgramsExplorerProps {
    userStats: UserAdmissionStats;
}

export const ProgramsExplorer = ({ userStats }: ProgramsExplorerProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInst, setSelectedInst] = useState<string[]>([]);
    const [onlyReachable, setOnlyReachable] = useState(false);
    const navigate = useNavigate();

    // Use Shared Data
    const items = ALL_PROGRAMS;

    const institutions = useMemo(() => {
        const insts = new Set(items.map(i => i.program.institution?.name).filter(Boolean));
        return Array.from(insts) as string[];
    }, [items]);

    const filteredPrograms = useMemo(() => {
        return items.filter(({ program }) => {
            const matchesSearch = program.name.includes(searchTerm) ||
                program.institution?.name.includes(searchTerm) ||
                program.description?.includes(searchTerm);
            const matchesInst = selectedInst.length === 0 || selectedInst.includes(program.institution?.name || '');

            // Note: Reachability check requires logic evaluation which is complex to do here without evaluating rules.
            // For MVP: We skip actual 'reachable' logic filter here or implement simple check if needed.
            // Keeping it simple for now (filter UI is there but logic requires 'checkReachable' utility).

            return matchesSearch && matchesInst;
        });
    }, [searchTerm, selectedInst, items]);

    const groupedPrograms = useMemo(() => {
        const groups: Record<string, typeof items> = {};
        filteredPrograms.forEach(item => {
            const instName = item.program.institution?.name || 'אחר';
            if (!groups[instName]) groups[instName] = [];
            groups[instName].push(item);
        });
        return groups;
    }, [filteredPrograms]);


    const toggleInst = (inst: string) => {
        setSelectedInst(prev =>
            prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]
        );
    };

    return (
        <div className="w-full relative min-h-screen pb-20">
            {/* Header / Filters Section */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                    {/* Search & Main Controls */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="חפש תואר, מוסד או תחום..."
                                className="pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-2xl transition-all"
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Quick Toggles */}
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
                            {/* Institution Filter Pills */}
                            {institutions.map(inst => (
                                <button
                                    key={inst}
                                    onClick={() => toggleInst(inst)}
                                    className={`
                                        whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all border
                                        ${selectedInst.includes(inst)
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {inst}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="space-y-12">
                    {Object.entries(groupedPrograms).map(([instName, progs]) => (
                        <section key={instName} className="scroll-mt-24">
                            {/* Section Header */}
                            <div className="flex items-center gap-3 mb-6 sticky top-[88px] z-20 bg-gray-50/95 backdrop-blur-sm py-3 border-b border-gray-200/50">
                                <Building2 className="w-6 h-6 text-gray-400" />
                                <h2 className="text-xl font-bold text-gray-800">{instName}</h2>
                                <Badge variant="secondary" className="rounded-full bg-white border border-gray-200">
                                    {progs.length} תוכניות
                                </Badge>
                            </div>

                            {/* Dense Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {progs.map(({ program, admission }) => (
                                    <CompactProgramCard
                                        key={program.id}
                                        program={program}
                                        admission={admission}
                                        userStats={userStats}
                                        onClick={() => navigate(`/program/${program.id}`)}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}

                    {filteredPrograms.length === 0 && (
                        <div className="text-center py-32 opacity-60">
                            <Search className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-500">לא נמצאו תוצאות לחיפוש זה</p>
                            <Button
                                variant="link"
                                className="text-blue-600"
                                onClick={() => { setSearchTerm(''); setSelectedInst([]); setOnlyReachable(false); }}
                            >
                                נקה סינונים
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
