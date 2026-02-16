import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { ConversationalHero } from '../components/marketing/ConversationalHero';
import { CookieConsent } from '../components/CookieConsent';
import { AccessibilityWidget } from '../components/AccessibilityWidget';
import { SmartWelcomeModal } from '../components/marketing/SmartWelcomeModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Footer } from '../components/Footer';
import { ValuePropositionSection } from '../components/marketing/ValuePropositionSection';

export const HomePage = () => {
    const navigate = useNavigate();

    // Auto-show lead capture modal for first-time visitors who haven't submitted/skipped
    const hasSeenModal = typeof window !== 'undefined' && localStorage.getItem('lead_captured');
    const [showModal, setShowModal] = useState(!hasSeenModal);
    const [pendingMode, setPendingMode] = useState<'manual' | 'upload' | null>(null);

    const handleModalClose = () => {
        setShowModal(false);

        // Execute the pending navigation if one exists
        if (pendingMode) {
            navigate(`/calculator?mode=${pendingMode}`);
            setPendingMode(null);
        }
    };

    const handleHeroAction = (action: 'manual' | 'upload') => {
        if (!hasSeenModal) {
            // First visit — show modal, then navigate after close
            setPendingMode(action);
            setShowModal(true);
        } else {
            // Already seen modal — go straight to calculator
            navigate(`/calculator?mode=${action}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans" dir="rtl">
            <Helmet>
                <title>מתלבטים בלימודים — מחשבון סיכויי קבלה לתואר ראשון</title>
                <meta name="description" content="מחשבון בגרויות חינמי — חשבו ממוצע בגרות, בדקו סיכויי קבלה ל-500+ תוכניות לימוד, וגלו לאן אתם יכולים להתקבל. קהילה של 50,000+ תלמידים." />
                <meta property="og:image" content="https://mitlabtim.co.il/logo_new.png" />
                <link rel="canonical" href="https://mitlabtim.co.il" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "מתלבטים בלימודים",
                    "url": "https://mitlabtim.co.il",
                    "description": "מחשבון סיכויי קבלה לאוניברסיטאות ומכללות בישראל — בדקו ממוצע בגרות, סכם אוניברסיטאי וסיכויי קבלה ל-500+ תוכניות.",
                    "applicationCategory": "EducationalApplication",
                    "operatingSystem": "Web",
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "ILS" },
                    "inLanguage": "he",
                    "provider": {
                        "@type": "Organization",
                        "name": "מתלבטים בלימודים",
                        "url": "https://mitlabtim.co.il",
                        "logo": "https://mitlabtim.co.il/logo_new.png",
                        "sameAs": ["https://t.me/MitlabtimBot"]
                    }
                })}</script>
            </Helmet>
            <Header />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-6 py-2 space-y-2">
                <SmartWelcomeModal isOpen={showModal} onClose={handleModalClose} />

                <section id="hero-section" className="animate-in fade-in zoom-in-95 duration-500">
                    <ConversationalHero
                        onStartUpload={() => handleHeroAction('upload')}
                        onManual={() => handleHeroAction('manual')}
                    />
                </section>
            </main>

            <ValuePropositionSection />

            <Footer />
            <CookieConsent />
            <AccessibilityWidget />
        </div>
    );
};
