import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Users, Flame, Target, MapPin, GraduationCap, TrendingUp, ArrowLeft } from 'lucide-react';

interface ClientViewData {
    partner_type: string;
    total_relevant_leads: number;
    lead_breakdown: { hot: number; warm: number; cold: number };
    academic_profile: {
        avg_bagrut: number;
        avg_psychometric: number;
        top_fields: { field: string; count: number }[];
    };
    intent_signals: {
        actively_comparing: number;
        tracked_programs: number;
    };
    journey_stages: Record<string, number>;
    geographic: { city: string; count: number }[];
    sample_profiles: {
        id: string;
        bagrut_avg: number | null;
        psychometric: number | null;
        temperature: string;
        fields: string[];
        journey_stage: string;
        city: string | null;
    }[];
}

const PARTNER_TYPE_LABELS: Record<string, string> = {
    university_registration: 'מוסדות לימוד',
    psychometric_prep: 'קורסי פסיכומטרי',
    bagrut_improvement: 'שיפור בגרויות',
    pre_academic_mechina: 'מכינות קדם-אקדמיות',
    scholarship: 'מלגות',
    general_counseling: 'ייעוץ אקדמי',
};

const TEMP_COLORS: Record<string, string> = {
    hot: 'bg-red-100 text-red-700',
    warm: 'bg-orange-100 text-orange-700',
    cold: 'bg-blue-100 text-blue-700',
};

const JOURNEY_LABELS: Record<string, string> = {
    anonymous: 'אנונימי',
    exploring: 'חוקר',
    comparing: 'משווה',
    deciding: 'מחליט',
    applied: 'נרשם',
};

export const ClientPortal: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const type = searchParams.get('type') || 'university_registration';

    const [partnerName, setPartnerName] = useState('');
    const [data, setData] = useState<ClientViewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                // Validate token
                const authRes = await fetch(`/api/client-portal-auth?token=${token}`);
                const auth = await authRes.json() as { valid?: boolean; partner_name?: string; error?: string };
                if (!auth.valid) {
                    setError('אין הרשאה. נא לפנות לצוות מתלבטים.');
                    setLoading(false);
                    return;
                }
                setPartnerName(auth.partner_name || '');

                // Fetch data
                const dataRes = await fetch(`/api/metrics/client-view?token=${token}&type=${type}`);
                const viewData = await dataRes.json() as ClientViewData;
                setData(viewData);
            } catch {
                setError('שגיאה בטעינת הנתונים');
            }
            setLoading(false);
        }
        load();
    }, [token, type]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">{error}</p>
                    <a href="/" className="text-purple-600 hover:underline text-sm">חזרה לדף הבית</a>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30" dir="rtl">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{partnerName}</h1>
                        <p className="text-xs text-gray-500">
                            {PARTNER_TYPE_LABELS[data.partner_type] || data.partner_type}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-[10px]">M</span>
                        </div>
                        <span className="text-xs text-gray-500">Powered by <b>Mitlabtim</b></span>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KPI icon={Users} label="לידים רלוונטיים" value={data.total_relevant_leads} color="purple" />
                    <KPI icon={Flame} label="לידים חמים" value={data.lead_breakdown.hot} color="red" />
                    <KPI icon={Target} label="משווים באופן פעיל" value={data.intent_signals.actively_comparing} color="orange" />
                    <KPI icon={TrendingUp} label="עוקבים אחרי תוכניות" value={data.intent_signals.tracked_programs} color="green" />
                </div>

                {/* Lead Temperature Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-800 mb-4">התפלגות לידים לפי "חום"</h2>
                    <div className="flex gap-4">
                        {(['hot', 'warm', 'cold'] as const).map(temp => {
                            const count = data.lead_breakdown[temp];
                            const pct = data.total_relevant_leads > 0
                                ? Math.round((count / data.total_relevant_leads) * 100)
                                : 0;
                            return (
                                <div key={temp} className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TEMP_COLORS[temp]}`}>
                                            {temp === 'hot' ? 'חם' : temp === 'warm' ? 'חמים' : 'קר'}
                                        </span>
                                        <span className="text-xs text-gray-500">{pct}%</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${temp === 'hot' ? 'bg-red-500' : temp === 'warm' ? 'bg-orange-400' : 'bg-blue-300'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{count}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Academic Profile */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-800 mb-4">פרופיל אקדמי ממוצע</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-700">{data.academic_profile.avg_bagrut || '-'}</p>
                                <p className="text-[10px] text-blue-600">ממוצע בגרות</p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-purple-700">{data.academic_profile.avg_psychometric || '-'}</p>
                                <p className="text-[10px] text-purple-600">ממוצע פסיכומטרי</p>
                            </div>
                        </div>
                        {data.academic_profile.top_fields.length > 0 && (
                            <>
                                <p className="text-xs text-gray-500 mb-2">תחומי עניין מובילים:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.academic_profile.top_fields.map(f => (
                                        <span key={f.field} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                            {f.field} ({f.count})
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Geographic Distribution */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-800 mb-4">
                            <MapPin className="w-4 h-4 inline ml-1" />
                            פיזור גיאוגרפי
                        </h2>
                        {data.geographic.length > 0 ? (
                            <div className="space-y-2">
                                {data.geographic.slice(0, 8).map(g => {
                                    const maxCount = data.geographic[0]?.count || 1;
                                    return (
                                        <div key={g.city} className="flex items-center gap-2">
                                            <span className="text-xs text-gray-600 w-20 truncate">{g.city}</span>
                                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-400 rounded-full"
                                                    style={{ width: `${(g.count / maxCount) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-700 w-8 text-left">{g.count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">אין מספיק נתונים גיאוגרפיים</p>
                        )}
                    </div>
                </div>

                {/* Sample Leads */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-800 mb-4">
                        <GraduationCap className="w-4 h-4 inline ml-1" />
                        דוגמאות לידים (אנונימיים)
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-right py-2 px-3 text-gray-500 font-medium">ID</th>
                                    <th className="text-right py-2 px-3 text-gray-500 font-medium">ממוצע בגרות</th>
                                    <th className="text-right py-2 px-3 text-gray-500 font-medium">פסיכומטרי</th>
                                    <th className="text-right py-2 px-3 text-gray-500 font-medium">חום</th>
                                    <th className="text-right py-2 px-3 text-gray-500 font-medium">שלב</th>
                                    <th className="text-right py-2 px-3 text-gray-500 font-medium">עיר</th>
                                    <th className="text-right py-2 px-3 text-gray-500 font-medium">תחומים</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.sample_profiles.map(profile => (
                                    <tr key={profile.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-2 px-3 font-mono text-gray-400">{profile.id}</td>
                                        <td className="py-2 px-3 font-medium">{profile.bagrut_avg?.toFixed(1) || '-'}</td>
                                        <td className="py-2 px-3 font-medium">{profile.psychometric || '-'}</td>
                                        <td className="py-2 px-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${TEMP_COLORS[profile.temperature] || TEMP_COLORS.cold}`}>
                                                {profile.temperature === 'hot' ? 'חם' : profile.temperature === 'warm' ? 'חמים' : 'קר'}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-gray-600">{JOURNEY_LABELS[profile.journey_stage] || profile.journey_stage}</td>
                                        <td className="py-2 px-3 text-gray-600">{profile.city || '-'}</td>
                                        <td className="py-2 px-3">
                                            <div className="flex gap-1">
                                                {profile.fields.map(f => (
                                                    <span key={f} className="bg-gray-100 text-[9px] px-1.5 py-0.5 rounded">{f}</span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-l from-purple-600 to-purple-700 rounded-xl p-6 text-white text-center">
                    <h2 className="text-lg font-bold mb-2">מוכנים לקבל את הלידים האלה?</h2>
                    <p className="text-sm text-purple-200 mb-4">
                        צרו איתנו קשר ונתאים עבורכם חבילה מותאמת אישית
                    </p>
                    <a
                        href="mailto:info@mitlabtim.co.il?subject=Client Portal - Interest"
                        className="inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-purple-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        צרו קשר
                    </a>
                </div>
            </main>
        </div>
    );
};

// Small KPI component for the client portal
const KPI: React.FC<{ icon: any; label: string; value: number; color: string }> = ({
    icon: Icon, label, value, color,
}) => {
    const bgColor = color === 'purple' ? 'bg-purple-50' : color === 'red' ? 'bg-red-50' : color === 'orange' ? 'bg-orange-50' : 'bg-green-50';
    const iconColor = color === 'purple' ? 'text-purple-600' : color === 'red' ? 'text-red-600' : color === 'orange' ? 'text-orange-600' : 'text-green-600';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bgColor} mb-2`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('he-IL')}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    );
};
