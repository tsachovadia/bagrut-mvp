import { CampaignLandingPage } from '../../components/marketing/CampaignLandingPage';

export function BagrutLanding() {
    return (
        <CampaignLandingPage config={{
            slug: 'bagrut',
            headline: 'חשבו את ממוצע הבגרות שלכם בדקה',
            subheadline: 'מחשבון חינמי לפי הנוסחאות הרשמיות של כל אוניברסיטה',
            ctaText: 'חשבו עכשיו — בחינם',
            ctaUrl: '/calculator?mode=manual',
            metaTitle: 'מחשבון בגרות חינמי 2026 — חשבו ממוצע בגרות בדקה | מתלבטים',
            metaDescription: 'חשבו את ממוצע הבגרות המדויק שלכם לפי הנוסחאות של כל אוניברסיטה. כולל בונוסים, יחידות לימוד, וסכם. מחשבון בגרויות חינמי.',
            keywords: 'מחשבון בגרות, ממוצע בגרות, חישוב בגרות 2026, מחשבון ציונים, ממוצע בגרות משוקלל',
            heroEmoji: '🎓',
            features: [
                { icon: '✅', title: 'נוסחאות רשמיות', desc: 'לפי כל אוניברסיטה' },
                { icon: '⚡', title: 'תוצאות מיידיות', desc: 'תוך 30 שניות' },
                { icon: '🔒', title: 'חינם ופרטי', desc: 'בלי רישום, בלי ספאם' },
            ],
        }} />
    );
}
