import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TrackedDegreesWidget } from '../components/TrackedDegreesWidget';
import { useTrackedDegrees } from '../context/TrackedDegreesContext';
import { calculateAdmissionStats } from '../utils/calculation-bridge';
import { useMemo, useEffect, useState } from 'react';
import { loadUserData } from '../lib/userData';
import type { UserAdmissionStats } from '../utils/admission-evaluation';

export const TrackedDegreesPage = () => {
    const navigate = useNavigate();
    const { trackedIds } = useTrackedDegrees();
    const [userStats, setUserStats] = useState<UserAdmissionStats | undefined>(undefined);

    // Just strictly load data to get stats for the widget
    useEffect(() => {
        const load = async () => {
            const data = await loadUserData();
            if (data && (data.bagrut.length > 0 || data.psychometric.general > 0)) {
                const stats = calculateAdmissionStats(data.bagrut, data.psychometric);
                const singleStat = {
                    bagrutAverage: stats.degrees[0]?.average || 0,
                    bagrutGrades: data.bagrut,
                    psychometric: data.psychometric,
                    estimatedSekhem: stats.degrees[0]?.detailedResults?.sechem_scores[0]?.score || 0
                };
                setUserStats(singleStat);
            }
        };
        load();
    }, []);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50" dir="rtl">
            <Helmet>
                <title>התוכניות שלי — מתלבטים בלימודים</title>
                <meta name="description" content="עקבו אחרי תוכניות הלימוד שמעניינות אתכם ובדקו את סיכויי הקבלה שלכם בכל אחת מהן." />
                <link rel="canonical" href="https://mitlabtim.co.il/tracking" />
            </Helmet>
            <Header />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">התארים שלי</h1>
                    <p className="text-gray-500">רשימת התוכניות ששמרת למעקב</p>
                </div>

                <TrackedDegreesWidget
                    className="min-h-[400px]"
                    userStats={userStats}
                />
            </main>
            <Footer />
        </div>
    );
};
