import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ArrowRight, AlertCircle, Calculator, TrendingUp, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/shim';
import { loadUserData } from '../lib/userData';
import { calculateAdmissionStats } from '../utils/calculation-bridge';
import type { SubjectGrade, PsychometricScores } from '../utils/calculator';
import { calculateBonus } from '../utils/bonuses';
import { ResultsAuthGate } from '../components/ResultsAuthGate';

export const SimulatorPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [hasData, setHasData] = useState(false);

    // Original Data (Reference)
    const [originalData, setOriginalData] = useState<{
        bagrut: SubjectGrade[];
        psychometric: PsychometricScores;
    } | null>(null);

    // Simulated Data (Editable)
    const [simulatedBagrut, setSimulatedBagrut] = useState<SubjectGrade[]>([]);
    const [simulatedPsychometric, setSimulatedPsychometric] = useState<PsychometricScores>({
        general: 0, quantitative: 0, verbal: 0, english: 0
    });

    // Results
    const [originalStats, setOriginalStats] = useState<any>(null);
    const [simulatedStats, setSimulatedStats] = useState<any>(null);

    useEffect(() => {
        async function checkData() {
            try {
                const data = await loadUserData();
                if (data && data.bagrut && data.bagrut.length > 0 && data.psychometric && data.psychometric.general > 0) {
                    setOriginalData(data);

                    // Initialize Simulation State
                    setSimulatedBagrut(JSON.parse(JSON.stringify(data.bagrut)));
                    setSimulatedPsychometric({ ...data.psychometric });

                    // Calc Original Stats
                    const stats = calculateAdmissionStats(data.bagrut, data.psychometric);
                    setOriginalStats(stats);

                    setHasData(true);
                } else {
                    setHasData(false);
                }
            } catch (error) {
                console.error("Error loading data:", error);
                setHasData(false);
            } finally {
                setLoading(false);
            }
        }
        checkData();
    }, []);

    // Calculate Simulated Stats whenever simulation data changes
    useEffect(() => {
        if (simulatedBagrut.length > 0) {
            const stats = calculateAdmissionStats(simulatedBagrut, simulatedPsychometric);
            setSimulatedStats(stats);
        }
    }, [simulatedBagrut, simulatedPsychometric]);

    const handleGradeChange = (index: number, field: 'grade' | 'units', value: number) => {
        const newBagrut = [...simulatedBagrut];
        newBagrut[index] = { ...newBagrut[index], [field]: value };
        setSimulatedBagrut(newBagrut);
    };

    const handlePsychometricChange = (field: keyof PsychometricScores, value: number) => {
        setSimulatedPsychometric(prev => ({ ...prev, [field]: value }));
    };

    const resetSimulation = () => {
        if (originalData) {
            setSimulatedBagrut(JSON.parse(JSON.stringify(originalData.bagrut)));
            setSimulatedPsychometric({ ...originalData.psychometric });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans" dir="rtl">
                <div className="text-gray-500">טוען נתונים...</div>
            </div>
        );
    }

    if (!hasData) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="mb-8 text-gray-500 hover:text-gray-900 -mr-2"
                    >
                        <ArrowRight className="w-4 h-4 ml-2" />
                        חזרה לדף הבית
                    </Button>

                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">חסרים נתונים לסימולציה</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            כדי שנוכל להראות לך איך שיפור הציונים ישפיע על קבלה ללימודים, אנחנו צריכים קודם לדעת את ציוני הבגרות והפסיכומטרי הנוכחיים שלך.
                        </p>
                        <Button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/20"
                        >
                            <Calculator className="w-5 h-5 ml-2" />
                            הכנס ציונים במחשבון
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Helper to calculate delta
    const getSechemDelta = () => {
        if (!originalStats || !simulatedStats) return 0;
        const originalScore = originalStats.degrees[0]?.sechem[0]?.score || 0;
        const newScore = simulatedStats.degrees[0]?.sechem[0]?.score || 0;
        return newScore - originalScore;
    };

    const sechemDelta = getSechemDelta();

    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
            <Helmet>
                <title>סימולטור שיפור ציונים — מתלבטים בלימודים</title>
                <meta name="description" content="שחקו עם הציונים וראו איך שיפור בגרויות או פסיכומטרי ישפיע על סיכויי הקבלה שלכם לאוניברסיטאות בישראל." />
                <meta property="og:title" content="סימולטור שיפור ציונים — מתלבטים בלימודים" />
                <meta property="og:description" content="גלו כמה נקודות סכם תרוויחו משיפור הציונים שלכם." />
                <link rel="canonical" href="https://mitlabtim.co.il/dashboard" />
            </Helmet>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/')}
                            className="mb-4 text-gray-500 hover:text-gray-900 -mr-2"
                        >
                            <ArrowRight className="w-4 h-4 ml-2" />
                            חזרה לדף הבית
                        </Button>

                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">סימולטור שיפור ציונים</h1>
                                <p className="text-gray-500 mt-1">שחקו עם הציונים וראו איך זה משפיע על סיכויי הקבלה</p>
                            </div>
                        </div>
                    </div>

                    {sechemDelta > 0 && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl border border-green-200 animate-in fade-in slide-in-from-bottom-4">
                            <TrendingUp className="w-5 h-5" />
                            <span className="font-bold">שיפור של {sechemDelta.toFixed(0)} נקודות בסכם!</span>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        onClick={resetSimulation}
                        className="text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                        <RotateCcw className="w-4 h-4 ml-2" />
                        אפס נתונים
                    </Button>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Controls */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Psychometric Controls */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm">1</span>
                                פסיכומטרי יעד
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">ציון כללי</label>
                                    <input
                                        type="number"
                                        value={simulatedPsychometric.general}
                                        onChange={(e) => handlePsychometricChange('general', Number(e.target.value))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-lg"
                                        min="200" max="800"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">כמותי</label>
                                    <input
                                        type="number"
                                        value={simulatedPsychometric.quantitative}
                                        onChange={(e) => handlePsychometricChange('quantitative', Number(e.target.value))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        min="50" max="150"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">מילולי</label>
                                    <input
                                        type="number"
                                        value={simulatedPsychometric.verbal}
                                        onChange={(e) => handlePsychometricChange('verbal', Number(e.target.value))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        min="50" max="150"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">אנגלית</label>
                                    <input
                                        type="number"
                                        value={simulatedPsychometric.english}
                                        onChange={(e) => handlePsychometricChange('english', Number(e.target.value))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        min="50" max="150"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bagrut Controls */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">2</span>
                                שיפור בגרויות
                            </h3>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {simulatedBagrut.map((subject, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 text-sm truncate">{subject.subject}</div>
                                            <div className="text-xs text-blue-600">
                                                {calculateBonus(subject.subject, subject.units, subject.grade)} נק' בונוס
                                            </div>
                                        </div>

                                        <div className="w-20">
                                            <label className="text-[10px] text-gray-400 block mb-0.5">יח"ל</label>
                                            <select
                                                value={subject.units}
                                                onChange={(e) => handleGradeChange(index, 'units', Number(e.target.value))}
                                                className="w-full bg-white border border-gray-200 rounded-lg text-sm py-1 px-1 focus:outline-none focus:border-blue-500"
                                            >
                                                {[1, 2, 3, 4, 5].map(u => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="w-20">
                                            <label className="text-[10px] text-gray-400 block mb-0.5">ציון</label>
                                            <input
                                                type="number"
                                                value={subject.grade}
                                                onChange={(e) => handleGradeChange(index, 'grade', Number(e.target.value))}
                                                className="w-full bg-white border border-gray-200 rounded-lg text-sm py-1 px-2 focus:outline-none focus:border-blue-500 placeholder-gray-300 font-bold text-gray-700"
                                                min="0" max="100"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Results */}
                    <div className="lg:col-span-7 space-y-6">
                        <ResultsAuthGate>
                            {/* Sechem Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                                <h3 className="text-blue-100 font-medium mb-2 relative z-10">סכם יעד משוער</h3>
                                <div className="flex items-baseline gap-4 relative z-10">
                                    <span className="text-6xl font-bold tracking-tight">
                                        {simulatedStats?.degrees[0]?.sechem[0]?.score?.toFixed(0) || 0}
                                    </span>
                                    {sechemDelta !== 0 && (
                                        <span className={`text-xl font-medium ${sechemDelta > 0 ? 'text-green-300' : 'text-red-300'}`}>
                                            {sechemDelta > 0 ? '+' : ''}{sechemDelta.toFixed(0)}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                        <div className="text-blue-100 text-sm mb-1">ממוצע בגרות</div>
                                        <div className="text-2xl font-bold">{simulatedStats?.bagrutAverage?.toFixed(2)}</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                        <div className="text-blue-100 text-sm mb-1">פסיכומטרי</div>
                                        <div className="text-2xl font-bold">{simulatedPsychometric.general}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Acceptance Impact */}
                            {simulatedStats?.degrees && simulatedStats.degrees.length > 0 && (
                                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-6">סיכויי קבלה</h3>
                                    <div className="space-y-4">
                                        {simulatedStats.degrees.slice(0, 5).map((degree: any, idx: number) => {
                                            // Mock threshold logic for visual variety if needed, 
                                            // but calculateAdmissionStats returns structured data.
                                            // It seems calculateAdmissionStats simulates 1 degree per university?
                                            // Looking at calculation-bridge.ts: it maps 'degrees' array.
                                            // Let's rely on what's returned.
                                            const originalDegree = originalStats?.degrees?.find((d: any) => d.university === degree.university);
                                            const wasAccepted = originalDegree?.status === 'excellent';
                                            const isAccepted = degree.status === 'excellent';

                                            // Identify if status changed
                                            const statusChanged = !wasAccepted && isAccepted;

                                            return (
                                                <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border ${statusChanged ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{degree.university}</div>
                                                        <div className="text-sm text-gray-500">{degree.sechem[0]?.explanation}</div>
                                                    </div>
                                                    <div className="text-left">
                                                        {statusChanged ? (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                עברת את הסף! 🚀
                                                            </span>
                                                        ) : isAccepted ? (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                קבלה בטוחה
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                לא עובר סף
                                                            </span>
                                                        )}
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            סכם: {degree.sechem[0]?.score?.toFixed(0)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </ResultsAuthGate>
                    </div>
                </div>
            </div>
        </div>
    );
};
