import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, GraduationCap, Building2, CheckCircle2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button, Input, Badge, Card, CardContent } from '../ui/shim'; // reusing shim components
import { ProgramDetailsCard } from '../ProgramDetailsCard';
import type { Program, AdmissionRequirement, LogicGroup, LogicCondition } from '../../types/admission';
import { supabase } from '../../lib/supabase';
import { checkReachable, type UserAdmissionStats } from '../../utils/admission-evaluation';

// Mock Data for initial render / fallback
const MOCK_PROGRAMS: { program: Program; admission: AdmissionRequirement }[] = [
    {
        program: {
            id: 'prog_bgu_cs',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'התוכנית היוקרתית למדעי המחשב באוניברסיטת בן-גוריון. דגש על מערכות נבונות, אבטחת סייבר ומדעי הנתונים.',
            career_opportunities: 'פיתוח תוכנה, מחקר, אלגוריתמיקה, הנדסת נתונים.',
            institution: { id: 'inst_bgu', name: 'אוניברסיטת בן-גוריון', type: 'university' },
            faculty: { id: 'fac_bgu_nature', name: 'הפקולטה למדעי הטבע' }
        },
        admission: {
            id: 'adm_bgu_cs',
            program_id: 'prog_bgu_cs',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "קבלה רגילה",
                        AND: [
                            { type: "sekhem_quant", operator: ">=", value: 760, label: "סכם כמותי 760+" }
                        ]
                    }
                ]
            }
        }
    },
    {
        program: {
            id: 'prog_tau_cs',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'לימודים מעמיקים במדעי המחשב באוניברסיטת תל אביב. התוכנית מובילה במחקר ובתעשייה.',
            career_opportunities: 'בוגרי התוכנית מחזיקים במשרות מפתח בחברות כמו גוגל, מיקרוסופט ומטא.',
            institution: { id: 'inst_tau', name: 'אוניברסיטת תל אביב', type: 'university' },
            faculty: { id: 'fac_tau_exact', name: 'הפקולטה למדעים מדויקים' }
        },
        admission: {
            id: 'adm_tau_cs',
            program_id: 'prog_tau_cs',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "קבלה על סמך סכם",
                        AND: [
                            { type: "sekhem_general", operator: ">=", value: 700, label: "סכם 700+" },
                            { type: "bagrut_math", operator: ">=", value: 90, label: "מתמטיקה 5 יח״ל 90+" }
                        ]
                    }
                ]
            }
        }
    }
];

interface ProgramsExplorerProps {
    userStats?: UserAdmissionStats;
}

export const ProgramsExplorer: React.FC<ProgramsExplorerProps> = ({ userStats }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInst, setSelectedInst] = useState<string[]>([]);
    const [onlyReachable, setOnlyReachable] = useState(false);
    const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
    const [programs, setPrograms] = useState<any[]>(MOCK_PROGRAMS);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch data from Supabase
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch programs with related data
                const { data, error } = await supabase
                    .from('programs')
                    .select(`
                        *,
                        faculty:faculties (
                            *,
                            institution:institutions (*)
                        ),
                        admission:program_admission_requirements (*)
                    `);

                if (error) throw error;

                if (data && data.length > 0) {
                    // Transform data into the shape expected by our components
                    const formatted = data.map((p: any) => ({
                        program: {
                            ...p,
                            institution: p.faculty?.institution,
                            faculty: p.faculty
                        },
                        // admission might be an object or array depending on Supabase relations. 
                        // If it's 1:Many it's array, 1:1 is object. Usually with foreign key reversed it's array.
                        admission: Array.isArray(p.admission) ? p.admission[0] : p.admission
                    })).filter(item => item.admission); // Only show programs with admission data

                    if (formatted.length > 0) {
                        setPrograms(formatted);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch programs, using mock data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredPrograms = programs.filter(({ program, admission }) => {
        const matchesSearch = program.name.includes(searchTerm) ||
            program.institution?.name.includes(searchTerm) ||
            program.description?.includes(searchTerm);

        const matchesInst = selectedInst.length === 0 || selectedInst.includes(program.institution?.name || '');

        const matchesReachable = !onlyReachable || (userStats ? checkReachable(userStats, admission) : true);

        return matchesSearch && matchesInst && matchesReachable;
    });

    const uniqueInstitutions = Array.from(new Set(programs.map(p => p.program.institution?.name).filter(Boolean))) as string[];

    return (
        <div className="min-h-screen bg-gray-50/50" dir="rtl">
            {/* Header Hero */}
            <div className="bg-white border-b border-gray-100 py-12 px-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="max-w-6xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        מצא את <span className="text-blue-600 relative whitespace-nowrap">
                            התואר הבא שלך
                            <svg className="absolute w-full h-3 -bottom-1 right-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        מאגר המידע המקיף בישראל לתנאי קבלה. חפשו בין מאות תארים, סננו לפי מוסדות וגלו לאן אתם מתקבלים.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

                {/* Sidebar Filters */}
                <aside className="lg:w-80 flex-shrink-0 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                        <div className="flex items-center gap-2 mb-6 text-gray-800 font-bold text-lg">
                            <Filter className="w-5 h-5" />
                            סינון חכם
                        </div>

                        {/* Search */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">חיפוש חופשי</label>
                                <div className="relative">
                                    <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="שם התואר, מוסד..."
                                        className="pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                        value={searchTerm}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Reachable Toggle */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                        רק מה שאני מתקבל/ת אליו
                                    </label>
                                    <div
                                        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${onlyReachable ? 'bg-blue-600' : 'bg-gray-300'}`}
                                        onClick={() => setOnlyReachable(!onlyReachable)}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${onlyReachable ? '-translate-x-4' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600/80">
                                    בהתבסס על נתוני הבגרות והפסיכומטרי שהזנת
                                </p>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Institutions */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-3 block">מוסד לימודים</label>
                                <div className="space-y-2 max-h-60 overflow-y-auto pl-2 custom-scrollbar">
                                    {uniqueInstitutions.map(inst => (
                                        <label key={inst} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedInst.includes(inst) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                                {selectedInst.includes(inst) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedInst.includes(inst)}
                                                onChange={() => {
                                                    setSelectedInst(prev =>
                                                        prev.includes(inst)
                                                            ? prev.filter(i => i !== inst)
                                                            : [...prev, inst]
                                                    );
                                                }}
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900">{inst}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Grid */}
                <main className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            תוצאות ({filteredPrograms.length})
                        </h2>
                        {/* Sort Dropdown could go here */}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {filteredPrograms.map(({ program, admission }) => (
                            <div key={program.id} className="group">
                                <div
                                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden
                                        ${expandedProgramId === program.id
                                            ? 'ring-2 ring-blue-500 shadow-xl border-transparent z-10 relative'
                                            : 'border-gray-200 hover:border-blue-200 hover:shadow-lg'}`}
                                >
                                    {/* Summary Row */}
                                    <div
                                        className="p-6 cursor-pointer flex flex-col md:flex-row gap-6 md:items-center justify-between"
                                        onClick={() => setExpandedProgramId(expandedProgramId === program.id ? null : program.id)}
                                    >
                                        <div className="flex gap-4 items-start">
                                            <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 group-hover:scale-105 transition-transform">
                                                <Building2 className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-xs py-0.5">
                                                        {program.institution?.name}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-gray-500 border-gray-200 text-xs py-0.5">
                                                        {program.degree_type}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {program.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                    {program.faculty?.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 min-w-[200px]">
                                            <div className="text-left">
                                                <div className="text-xs text-gray-400 mb-1">תנאי קבלה משוערים</div>
                                                <div className="font-semibold text-gray-700 text-sm">
                                                    {/* Quick summary processing logic could go here */}
                                                    סכם / פסיכומטרי
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`rounded-full w-10 h-10 p-0 transition-transform duration-300 ${expandedProgramId === program.id ? 'bg-blue-50 text-blue-600 rotate-180' : 'text-gray-400 hover:bg-gray-100'}`}
                                            >
                                                <ChevronDown className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <div
                                        className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedProgramId === program.id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                                    >
                                        <div className="border-t border-gray-100 bg-gray-50/30 p-4 md:p-8">
                                            <ProgramDetailsCard program={program} admission={admission} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredPrograms.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">לא נמצאו תארים</h3>
                                <p className="text-gray-500">נסה לשנות את סינון החיפוש או לנקות את הפילטרים</p>
                                <Button
                                    variant="link"
                                    className="text-blue-600 mt-2"
                                    onClick={() => { setSearchTerm(''); setSelectedInst([]); setOnlyReachable(false); }}
                                >
                                    נקה הכל
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};
