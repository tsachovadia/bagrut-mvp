import { CampaignLandingPage } from '../../components/marketing/CampaignLandingPage';

export function KabalaLanding() {
    return (
        <CampaignLandingPage config={{
            slug: 'kabala',
            headline: 'לאן יש לכם סיכוי להתקבל?',
            subheadline: 'בדקו סיכויי קבלה ל-500+ תוכניות לימוד בכל האוניברסיטאות',
            ctaText: 'בדקו סיכויי קבלה — חינם',
            ctaUrl: '/calculator?mode=manual',
            metaTitle: 'סיכויי קבלה לאוניברסיטה 2026 — בדקו לאן תתקבלו | מתלבטים',
            metaDescription: 'בדקו סיכויי קבלה לאוניברסיטאות ומכללות בישראל. הכניסו ציונים וגלו ל-500+ תוכניות לימוד לאן יש לכם סיכוי להתקבל.',
            keywords: 'סיכויי קבלה, קבלה לאוניברסיטה, קבלה ללימודים 2026, תנאי קבלה, לאן אתקבל',
            heroEmoji: '🎯',
            features: [
                { icon: '📋', title: '500+ תוכניות', desc: 'כל האוניברסיטאות והמכללות' },
                { icon: '🔍', title: 'בדיקה מדויקת', desc: 'לפי תנאי קבלה רשמיים' },
                { icon: '💡', title: 'המלצות חכמות', desc: 'גלו תוכניות שלא הכרתם' },
            ],
        }} />
    );
}
