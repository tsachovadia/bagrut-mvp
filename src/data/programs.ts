
import type { Program, AdmissionRequirement } from '../types/admission';

export const ALL_PROGRAMS: { program: Program; admission: AdmissionRequirement }[] = [
    {
        program: {
            id: 'prog_bgu_cs',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'התוכנית למדעי המחשב באוניברסיטת בן-גוריון מכשירה חוקרים ומפתחים מובילים בתעשייה. הלימודים משלבים ידע תיאורטי מעמיק עם התנסות מעשית, כולל קורסים בבינה מלאכותית, סייבר, ומדעי הנתונים. הבוגרים משתלבים בחברות ההייטק המובילות בארץ ובעולם.',
            career_opportunities: 'פיתוח תוכנה, מחקר במדעי המחשב, הנדסת נתונים (Data Science), סייבר ואבטחת מידע, יזמות טכנולוגית.',
            institution: { id: 'inst_bgu', name: 'אוניברסיטת בן-גוריון', type: 'university', logo_url: 'https://upload.wikimedia.org/wikipedia/he/c/c5/Ben_Gurion_University_of_the_Negev_Logo.svg', website_url: 'https://in.bgu.ac.il/natsci/cs/Pages/default.aspx' },
            faculty: { id: 'fac_bgu_nature', name: 'הפקולטה למדעי הטבע' }
        },
        admission: {
            id: 'adm_bgu_cs',
            program_id: 'prog_bgu_cs',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "קבלה רגילה",
                        AND: [
                            { type: "sekhem_quant", operator: ">=", value: 760, label: "סכם כמותי 760+" }
                        ]
                    }
                ]
            }
        }
    },
    {
        program: {
            id: 'prog_tau_cs',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'בית הספר למדעי המחשב באוניברסיטת תל אביב הוא מהמובילים בעולם. התוכנית מעניקה בסיס מתמטי וחשובי רחב, המאפשר לבוגרים להתמודד עם אתגרי המחר בטכנולוגיה. סגל המרצים מורכב מחוקרים בעלי שם עולמי.',
            career_opportunities: 'משרות מחקר ופיתוח בחברות FAANG (Google, Meta, Apple), תפקידי ניהול מוצר טכנולוגי, והמשך לתארים מתקדמים.',
            institution: { id: 'inst_tau', name: 'אוניברסיטת תל אביב', type: 'university', logo_url: 'https://upload.wikimedia.org/wikipedia/he/3/3b/Tel_Aviv_University_Logo.svg', website_url: 'https://cs.tau.ac.il/' },
            faculty: { id: 'fac_tau_exact', name: 'הפקולטה למדעים מדויקים' }
        },
        admission: {
            id: 'adm_tau_cs',
            program_id: 'prog_tau_cs',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "קבלה רגילה",
                        AND: [
                            { type: "sekhem", operator: ">=", value: 730, label: "ציון התאמה 730+" }
                        ]
                    }
                ]
            }
        }
    },
    {
        program: {
            id: 'prog_huji_cs',
            name: 'הנדסת מחשבים',
            degree_type: 'B.Sc',
            duration_years: 4,
            description: 'התוכנית להנדסת מחשבים באוניברסיטה העברית משלבת לימודי מדעי המחשב עם הנדסת חשמל, ומכשירה מהנדסים בעלי הבנה מערכתית רחבה של חומרה ותוכנה. הסטודנטים נהנים מגישה למעבדות מתקדמות ומחקר פורץ דרך.',
            career_opportunities: 'פיתוח שבבים (VLSI), מערכות משובצות מחשב (Embedded), רובוטיקה, ומעבדי אותות.',
            institution: { id: 'inst_huji', name: 'האוניברסיטה העברית', type: 'university', logo_url: 'https://upload.wikimedia.org/wikipedia/he/8/87/Hebrew_University_Logo.svg', website_url: 'https://en.cs.huji.ac.il/' },
            faculty: { id: 'fac_huji_eng', name: 'ביה"ס להנדסה ומדעי המחשב' }
        },
        admission: {
            id: 'adm_huji_cs',
            program_id: 'prog_huji_cs',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "קבלה ישירה",
                        AND: [{ type: "psychometric", operator: ">=", value: 740, label: "פסיכומטרי 740+" }]
                    }
                ]
            }
        }
    },
    {
        program: {
            id: 'prog_tech_cs',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'הפקולטה למדעי המחשב בטכניון היא הגדולה והמובילה בישראל. התוכנית שמה דגש על מצוינות אקדמית וחדשנות טכנולוגית. בוגרי הטכניון מהווים את עמוד השדרה של תעשיית ההייטק הישראלית.',
            career_opportunities: 'הובלה טכנולוגית (CTO), ארכיטקטורת תוכנה, מחקר באלגוריתמים, ופיתוח מערכות מורכבות.',
            institution: { id: 'inst_tech', name: 'הטכניון', type: 'university', logo_url: 'https://upload.wikimedia.org/wikipedia/he/0/00/Technion_Logo.svg', website_url: 'https://cs.technion.ac.il/' },
            faculty: { id: 'fac_tech_cs', name: 'הפקולטה למדעי המחשב' }
        },
        admission: {
            id: 'adm_tech_cs',
            program_id: 'prog_tech_cs',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "סכם טכניון",
                        AND: [{ type: "sekhem", operator: ">=", value: 92, label: "סכם 92+" }]
                    }
                ]
            }
        }
    },
    {
        program: {
            id: 'prog_biu_llb',
            name: 'משפטים',
            degree_type: 'LL.B',
            duration_years: 3.5,
            description: 'הפקולטה למשפטים באוניברסיטת בר אילן מציעה תוכנית לימודים ייחודית המשלבת מצוינות משפטית עם ערכים. התוכנית כוללת קליניקות משפטיות מעשיות ומגוון התמכויות במשפט פלילי, אזרחי ומסחרי.',
            career_opportunities: 'עריכת דין במשרדים מובילים, יועצים משפטיים בחברות, מסלול לשיפוט, ופרקליטות המדינה.',
            institution: { id: 'inst_biu', name: 'אוניברסיטת בר אילן', type: 'university', logo_url: 'https://upload.wikimedia.org/wikipedia/he/0/04/Bar-Ilan_University_Logo.svg', website_url: 'https://law.biu.ac.il/' },
            faculty: { id: 'fac_biu_law', name: 'הפקולטה למשפטים' }
        },
        admission: {
            id: 'adm_biu_llb',
            program_id: 'prog_biu_llb',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "ממוצע בגרות",
                        AND: [{ type: "bagrut_avg", operator: ">=", value: 105, label: "ממוצע בגרות 105+" }]
                    }
                ]
            }
        }
    }
];
