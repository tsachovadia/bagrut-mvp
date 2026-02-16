import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    ChevronRight, Loader2, School, BookOpen, Briefcase, Clock,
    GraduationCap, ExternalLink, Send, CheckCircle2, AlertCircle,
    Users, MessageCircle, Plus, Globe
} from 'lucide-react';
import { admissionEngine } from '../services/admission-engine';
import { trackEvent } from '../utils/gtm';
import { Button, Badge } from '../components/ui/shim';
import { checkReachable, type UserAdmissionStats } from '../utils/admission-evaluation';
import { useTrackedDegrees } from '../context/TrackedDegreesContext';
import type { LogicGroup, LogicCondition } from '../types/admission';

interface ProgramPageProps {
    userStats?: UserAdmissionStats;
}

// --- Logic Renderer (inline) ---
const isGroup = (node: LogicGroup | LogicCondition): node is LogicGroup => {
    return 'AND' in node || 'OR' in node;
};

const ConditionItem = ({ condition }: { condition: LogicCondition }) => (
    <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100">
        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
        <div>
            <span className="font-medium text-gray-900 text-sm">
                {condition.label || `${condition.type} ${condition.operator} ${condition.value}`}
            </span>
            {(condition.subject || condition.units) && (
                <span className="text-xs text-gray-400 block">
                    {condition.subject} {condition.units ? `(${condition.units} יח"ל)` : ''}
                </span>
            )}
        </div>
    </div>
);

const LogicRenderer = ({ node, level = 0 }: { node: LogicGroup | LogicCondition; level?: number }) => {
    if (!isGroup(node)) return <ConditionItem condition={node} />;

    if (node.OR) {
        return (
            <div className="space-y-4">
                {level === 0 && (
                    <div className="flex items-center gap-2 mb-2">
                        <School className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-gray-900 text-sm">מסלולי קבלה אפשריים</span>
                    </div>
                )}
                <div className="grid grid-cols-1 gap-3">
                    {node.OR.map((child, idx) => (
                        <div key={idx} className="rounded-xl border-2 border-blue-100 bg-blue-50/30 p-4 relative overflow-hidden">
                            {isGroup(child) && child.name && (
                                <div className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-bl-lg absolute top-0 right-0">
                                    {child.name}
                                </div>
                            )}
                            <div className={isGroup(child) && child.name ? 'pt-5' : ''}>
                                <LogicRenderer node={child} level={level + 1} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (node.AND) {
        return (
            <div className="space-y-2">
                {node.name && (
                    <div className="font-bold text-gray-700 text-sm flex items-center gap-1.5 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        {node.name}
                    </div>
                )}
                <div className="flex flex-col gap-1.5">
                    {node.AND.map((child, idx) => (
                        <LogicRenderer key={idx} node={child} level={level + 1} />
                    ))}
                </div>
            </div>
        );
    }

    return null;
};

// --- Main Page ---
export const ProgramPage = ({ userStats }: ProgramPageProps) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [programData, setProgramData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { isTracked, toggleTrack } = useTrackedDegrees();

    useEffect(() => {
        if (!id) return;
        const fetchProgram = async () => {
            try {
                const allPrograms = await admissionEngine.getAllProgramsFull();
                const found = allPrograms.find(p => p.id === id);
                if (found) {
                    const mapped = admissionEngine.mapProgramToUI(found);
                    setProgramData(mapped);
                    trackEvent('program_viewed', {
                        program_id: id,
                        program_name: mapped.program?.name,
                        institution: mapped.program?.institution?.name,
                    });
                } else {
                    setError(true);
                }
            } catch (e) {
                console.error('Failed to load program:', e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProgram();
    }, [id]);

    const program = programData?.program;
    const admission = programData?.admission;

    const isReachable = useMemo(() => {
        if (!userStats || !admission) return null;
        return checkReachable(userStats, admission);
    }, [userStats, admission]);

    const hasUserData = userStats && (userStats.bagrutAverage > 0 || userStats.psychometric?.general > 0);
    const tracked = id ? isTracked(id) : false;

    // Determine best link for the program
    const programLink = program?.website_url || program?.institution?.website_url;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-gray-400 text-sm">טוען תוכנית...</p>
                </div>
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="flex-1 flex items-center justify-center py-20">
                <div className="text-center">
                    <p className="text-gray-500 text-lg mb-3">התוכנית לא נמצאה</p>
                    <button onClick={() => navigate('/programs')} className="text-indigo-600 hover:underline font-medium">
                        חזרה לסייר התוכניות
                    </button>
                </div>
            </div>
        );
    }

    const pageTitle = `${program.name} — ${program.institution?.name} | מתלבטים בלימודים`;
    const pageDescription = program.description
        || `תוכנית ${program.name} ב${program.institution?.name} — ${program.degree_type}, ${program.duration_years} שנים. בדקו תנאי קבלה, סיכויי קבלה ושוחחו עם סטודנטים.`;

    return (
        <div className="flex-1 bg-gray-50 pb-20">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <link rel="canonical" href={`https://mitlabtim.co.il/program/${id}`} />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "EducationalOccupationalProgram",
                    "name": program.name,
                    "description": pageDescription,
                    "provider": {
                        "@type": "EducationalOrganization",
                        "name": program.institution?.name,
                        ...(program.institution?.website_url && { "url": program.institution.website_url }),
                    },
                    "educationalProgramMode": "full-time",
                    "timeToComplete": `P${program.duration_years}Y`,
                    "educationalCredentialAwarded": program.degree_type,
                    "url": `https://mitlabtim.co.il/program/${id}`,
                })}</script>
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "תוכניות לימוד", "item": "https://mitlabtim.co.il/programs" },
                        { "@type": "ListItem", "position": 2, "name": program.name, "item": `https://mitlabtim.co.il/program/${id}` },
                    ],
                })}</script>
            </Helmet>
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 h-10 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors text-sm"
                    >
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-medium">חזרה</span>
                    </button>
                    <span className="mx-2 text-gray-300">/</span>
                    <button onClick={() => navigate('/programs')} className="text-sm text-gray-400 hover:text-indigo-600">סייר התוכניות</button>
                </div>
            </div>

            {/* Hero */}
            <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_70%)]" />
                <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
                    <div className="flex items-start gap-4">
                        {/* Logo */}
                        <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center p-1.5 shrink-0">
                            {program.institution?.logo_url && !imageError ? (
                                <img
                                    src={program.institution.logo_url}
                                    alt={program.institution.name}
                                    className="w-full h-full object-contain"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <School className="w-8 h-8 text-indigo-600" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-[11px] font-bold text-blue-200 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                                    {program.degree_type}
                                </span>
                                <span className="text-blue-200 text-xs">•</span>
                                <span className="text-blue-200 text-xs">{program.institution?.name}</span>
                                {program.faculty?.name && (
                                    <>
                                        <span className="text-blue-200 text-xs">•</span>
                                        <span className="text-blue-200 text-xs">{program.faculty.name}</span>
                                    </>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                                {program.name}
                            </h1>

                            {/* Quick Actions */}
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => id && toggleTrack(id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        tracked
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                                    }`}
                                >
                                    {tracked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                    {tracked ? 'במעקב' : 'הוסף למעקב'}
                                </button>
                                {programLink && (
                                    <a
                                        href={programLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white/80 hover:bg-white/20 border border-white/15 transition-all"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        לאתר התוכנית
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

                {/* Admission Status Card */}
                {hasUserData && isReachable !== null && (
                    <div className={`p-4 rounded-xl border flex items-center gap-4 animate-in fade-in slide-in-from-top-2 ${
                        isReachable
                            ? 'bg-green-50 border-green-200'
                            : 'bg-amber-50 border-amber-200'
                    }`}>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                            isReachable ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                            {isReachable ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className={`font-bold text-sm ${isReachable ? 'text-green-800' : 'text-amber-800'}`}>
                                {isReachable ? 'סיכויי קבלה גבוהים!' : 'סיכויים גבוליים — יש מה לשפר'}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                                בהתבסס על הממוצע ({userStats!.bagrutAverage.toFixed(1)})
                                {userStats!.psychometric?.general > 0 && ` והפסיכומטרי (${userStats!.psychometric.general})`}
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Facts */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl border border-gray-100 p-3">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">משך הלימודים</span>
                        </div>
                        <div className="font-bold text-gray-900">{program.duration_years} שנים</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-3">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">סוג תואר</span>
                        </div>
                        <div className="font-bold text-gray-900">{program.degree_type}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-3">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <School className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">מוסד</span>
                        </div>
                        <div className="font-bold text-gray-900 text-sm truncate">{program.institution?.name}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-3">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">פקולטה</span>
                        </div>
                        <div className="font-bold text-gray-900 text-sm truncate">{program.faculty?.name || 'כללי'}</div>
                    </div>
                </div>

                {/* About the Program */}
                <section className="bg-white rounded-xl border border-gray-100 p-5">
                    <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        על התוכנית
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {program.description ||
                            `התוכנית ל${program.name} ב${program.institution?.name} מציעה לימודים מקיפים בתחום, המשלבים ידע תיאורטי מעמיק עם התנסות מעשית. הלימודים נמשכים ${program.duration_years} שנים ומובילים לתואר ${program.degree_type}.`
                        }
                    </p>
                </section>

                {/* Career Opportunities */}
                {program.career_opportunities && (
                    <section className="bg-white rounded-xl border border-gray-100 p-5">
                        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-green-600" />
                            אפשרויות תעסוקה
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {program.career_opportunities}
                        </p>
                    </section>
                )}

                {/* Admission Requirements */}
                {admission?.logic_rules && (Object.keys(admission.logic_rules).length > 0) && (
                    <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <School className="w-4 h-4 text-indigo-600" />
                                תנאי קבלה
                            </h2>
                            {admission.year && (
                                <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                                    {admission.year}
                                </span>
                            )}
                        </div>
                        <div className="p-5">
                            <LogicRenderer node={admission.logic_rules} />
                        </div>
                    </section>
                )}

                {/* Community CTA — "למה להתלבט לבד?" */}
                <section className="bg-gradient-to-l from-[#0088cc]/5 to-blue-50 rounded-2xl border border-blue-100 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-[#0088cc]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-[#0088cc]/10 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5 text-[#0088cc]" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">למה להתלבט לבד?</h2>
                                <p className="text-xs text-gray-500">דבר עם סטודנטים שכבר לומדים את התואר הזה</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            יש שאלות על {program.name} ב{program.institution?.name}? רוצה לשמוע מסטודנטים אמיתיים על חווית הלימודים, הקורסים, האווירה והתעסוקה? הבוט שלנו יחבר אותך ישירות לסטודנטים שלומדים בדיוק את התואר הזה.
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <button
                                onClick={() => window.open(`https://t.me/MitlabtimBot?start=${program.id}`, '_blank')}
                                className="inline-flex items-center justify-center gap-2.5 bg-[#0088cc] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#006da3] transition-all shadow-md hover:shadow-lg text-sm"
                            >
                                <Send className="w-4 h-4" />
                                חבר אותי לסטודנטים
                            </button>

                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>חינם ובלי התחייבות, דרך טלגרם</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bottom Action Bar */}
                {!hasUserData && (
                    <section className="bg-indigo-50 rounded-xl border border-indigo-100 p-5 text-center">
                        <p className="text-sm text-gray-700 mb-3">
                            רוצה לדעת מה הסיכויים שלך להתקבל?
                        </p>
                        <Button
                            onClick={() => navigate('/')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                        >
                            <GraduationCap className="w-4 h-4 ml-2" />
                            הזן ציונים וגלה את הסיכויים שלך
                        </Button>
                    </section>
                )}
            </div>
        </div>
    );
};
