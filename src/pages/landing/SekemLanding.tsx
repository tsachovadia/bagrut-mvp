import { CampaignLandingPage } from '../../components/marketing/CampaignLandingPage';

export function SekemLanding() {
    return (
        <CampaignLandingPage config={{
            slug: 'sekem',
            headline: 'כמה סכם יש לכם?',
            subheadline: 'חשבו את הסכם האוניברסיטאי שלכם — לפי הטכניון, תל אביב, העברית ועוד',
            ctaText: 'חשבו את הסכם שלכם',
            ctaUrl: '/calculator?mode=manual',
            metaTitle: 'חישוב סכם אוניברסיטאי 2026 — מחשבון סכם חינמי | מתלבטים',
            metaDescription: 'חשבו את הסכם שלכם לטכניון, אוניברסיטת תל אביב, העברית ובן גוריון. נוסחאות מדויקות, בונוסים, והשוואה בין מוסדות.',
            keywords: 'חישוב סכם, סכם אוניברסיטאי, סכם טכניון, סכם תל אביב, סכם בן גוריון, מחשבון סכם',
            heroEmoji: '📊',
            features: [
                { icon: '🏫', title: '7 אוניברסיטאות', desc: 'טכניון, תל אביב, עברית ועוד' },
                { icon: '📐', title: 'נוסחאות מדויקות', desc: 'עדכון 2026' },
                { icon: '📈', title: 'סימולטור שיפור', desc: 'ראו איך לעלות את הסכם' },
            ],
        }} />
    );
}
