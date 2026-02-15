import { ImageResponse } from '@vercel/og';

export const config = {
    runtime: 'edge',
};

// Presets for known pages
const PAGE_PRESETS: Record<string, { title: string; subtitle: string }> = {
    home: {
        title: 'מתלבטים בלימודים',
        subtitle: 'מחשבון סיכויי קבלה לתואר ראשון — 500+ תוכניות לימוד',
    },
    blog: {
        title: 'הבלוג שלנו',
        subtitle: 'מאמרים, טיפים ומדריכים על בגרויות, פסיכומטרי וקבלה לאוניברסיטה',
    },
    programs: {
        title: 'חיפוש תוכניות לימוד',
        subtitle: 'בדקו סיכויי קבלה ל-500+ תוכניות לימוד בכל האוניברסיטאות',
    },
    'open-days': {
        title: 'ימים פתוחים 2026',
        subtitle: 'כל הימים הפתוחים, מועדי פסיכומטרי ומועדי הרשמה במקום אחד',
    },
};

export default async function handler(request: Request) {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '';
    const customTitle = url.searchParams.get('title') || '';
    const customSubtitle = url.searchParams.get('subtitle') || '';

    const preset = PAGE_PRESETS[page];
    const title = customTitle || preset?.title || 'מתלבטים בלימודים';
    const subtitle = customSubtitle || preset?.subtitle || 'קהילת 50,000+ תלמידים — מחשבון בגרויות, סיכויי קבלה ותכנון לימודים';

    // Load Heebo font (Hebrew)
    const heeboFont = await fetch(
        'https://fonts.gstatic.com/s/heebo/v26/NGS6v5_NC0k9P9H0TbFhsqMA.woff'
    ).then(res => res.arrayBuffer());

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 40%, #4C1D95 100%)',
                    fontFamily: 'Heebo',
                    direction: 'rtl',
                    padding: '60px',
                }}
            >
                {/* Top decorative circles */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-80px',
                        right: '-80px',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        display: 'flex',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-60px',
                        left: '-60px',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.04)',
                        display: 'flex',
                    }}
                />

                {/* Stats bar */}
                <div
                    style={{
                        display: 'flex',
                        gap: '40px',
                        marginBottom: '40px',
                    }}
                >
                    {[
                        { num: '50,000+', label: 'תלמידים בקהילה' },
                        { num: '500+', label: 'תוכניות לימוד' },
                        { num: '7+', label: 'שנות ניסיון' },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '12px 24px',
                                background: 'rgba(255,255,255,0.12)',
                                borderRadius: '12px',
                            }}
                        >
                            <span style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>
                                {stat.num}
                            </span>
                            <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: '56px',
                        fontWeight: 700,
                        color: '#ffffff',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        marginBottom: '16px',
                        display: 'flex',
                    }}
                >
                    {title}
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: '24px',
                        color: 'rgba(255,255,255,0.85)',
                        textAlign: 'center',
                        lineHeight: 1.5,
                        maxWidth: '800px',
                        display: 'flex',
                    }}
                >
                    {subtitle}
                </div>

                {/* Bottom domain */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)' }}>
                        mitlabtim.co.il
                    </span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'Heebo',
                    data: heeboFont,
                    weight: 700,
                    style: 'normal',
                },
            ],
        },
    );
}
