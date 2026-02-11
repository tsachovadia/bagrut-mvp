import React, { useState, useEffect } from 'react';
import { Users, Shield, BookOpen, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { grantBasicConsent, hasAnyConsent } from '../../lib/consent';

interface CommunityStepProps {
    onNext: () => void;
    onSkip?: () => void;
}

export const CommunityStep: React.FC<CommunityStepProps> = ({ onNext }) => {
    const [agreed, setAgreed] = useState(false);
    const [socialProof, setSocialProof] = useState({ total_users: 0, calculations_this_week: 0 });

    // Skip this step if consent already given
    useEffect(() => {
        if (hasAnyConsent()) {
            onNext();
        }
    }, [onNext]);

    // Fetch social proof numbers
    useEffect(() => {
        fetch('/api/metrics/social-proof')
            .then(r => r.json())
            .then(data => setSocialProof(data as any))
            .catch(() => {
                // Fallback numbers
                setSocialProof({ total_users: 50000, calculations_this_week: 1200 });
            });
    }, []);

    const handleStart = async () => {
        if (!agreed) return;
        await grantBasicConsent('wizard_community_step');
        onNext();
    };

    return (
        <div className="max-w-lg mx-auto px-4 py-6">
            {/* Hero */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                    ברוכים הבאים ל<span className="text-purple-600">מתלבטים</span>
                </h1>
                <p className="text-sm text-gray-600">
                    הקהילה הגדולה בישראל של תלמידים שמתקדמים ביחד
                </p>
            </div>

            {/* Social Proof */}
            {socialProof.total_users > 0 && (
                <div className="flex justify-center gap-6 mb-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                            {socialProof.total_users > 1000
                                ? `${Math.round(socialProof.total_users / 1000)}K+`
                                : socialProof.total_users.toLocaleString('he-IL')}
                        </p>
                        <p className="text-[10px] text-gray-500">תלמידים השתמשו</p>
                    </div>
                    <div className="w-px bg-gray-200" />
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                            {socialProof.calculations_this_week.toLocaleString('he-IL')}
                        </p>
                        <p className="text-[10px] text-gray-500">חישובים השבוע</p>
                    </div>
                </div>
            )}

            {/* What we do */}
            <div className="space-y-3 mb-6">
                <InfoCard
                    icon={BookOpen}
                    title="חישוב מדויק"
                    description="מחשבים ממוצע בגרות, סכם, ומראים לאיפה יש לך סיכוי להתקבל"
                    color="blue"
                />
                <InfoCard
                    icon={Users}
                    title="קהילה פעילה"
                    description="מחברים אותך לתלמידים עם פרופיל דומה שמתמודדים עם אותם שאלות"
                    color="purple"
                />
                <InfoCard
                    icon={Shield}
                    title="מידע מאובטח"
                    description="הציונים שלך נשמרים בצורה מאובטחת ומשמשים רק כדי לעזור לך"
                    color="green"
                />
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer mb-4 hover:bg-gray-100 transition-colors">
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                    מאשר/ת שמירת נתונים לצורך חישוב סיכויי קבלה וקבלת עדכונים מהקהילה.{' '}
                    <a href="/terms" target="_blank" className="text-purple-600 underline hover:text-purple-700">
                        תנאי שימוש
                    </a>
                </span>
            </label>

            {/* CTA */}
            <button
                onClick={handleStart}
                disabled={!agreed}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${agreed
                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
            >
                <ArrowLeft className="w-4 h-4" />
                בואו נתחיל!
            </button>
        </div>
    );
};

// Helper component
const InfoCard: React.FC<{
    icon: any;
    title: string;
    description: string;
    color: 'blue' | 'purple' | 'green';
}> = ({ icon: Icon, title, description, color }) => {
    const bgColor = color === 'blue' ? 'bg-blue-50' : color === 'purple' ? 'bg-purple-50' : 'bg-green-50';
    const iconColor = color === 'blue' ? 'text-blue-600' : color === 'purple' ? 'text-purple-600' : 'text-green-600';

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-100">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bgColor} shrink-0`}>
                <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
        </div>
    );
};
