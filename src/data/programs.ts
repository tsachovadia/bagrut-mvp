import type { Program, AdmissionRequirement } from '../types/admission';

export const ALL_PROGRAMS: { program: Program; admission: AdmissionRequirement }[] = [
    // --- Ben Gurion ---
    {
        program: {
            id: 'prog_bgu_cs',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'התוכנית למדעי המחשב באוניברסיטת בן-גוריון מכשירה חוקרים ומפתחים מובילים בתעשייה. הלימודים משלבים ידע תיאורטי מעמיק עם התנסות מעשית, כולל קורסים בבינה מלאכותית, סייבר, ומדעי הנתונים.',
            career_opportunities: 'פיתוח תוכנה, מחקר במדעי המחשב, הנדסת נתונים (Data Science), סייבר ואבטחת מידע, יזמות טכנולוגית.',
            institution: { id: 'inst_bgu', name: 'אוניברסיטת בן-גוריון', type: 'university', logo_url: 'https://logo.clearbit.com/bgu.ac.il', website_url: 'https://in.bgu.ac.il/natsci/cs/Pages/default.aspx' },
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
            id: 'prog_bgu_ee',
            name: 'הנדסת חשמל ומחשבים',
            degree_type: 'B.Sc',
            duration_years: 4,
            description: 'המחלקה להנדסת חשמל ומחשבים בבן-גוריון היא מהגדולות בארץ. התוכנית מעניקה ידע רחב בתחומי האלקטרוניקה, תקשורת, עיבוד אותות ומחשבים.',
            career_opportunities: 'מהנדסי חומרה, פיתוח צ׳יפים, תקשורת, מערכות הספק ואנרגיה ירוקה.',
            institution: { id: 'inst_bgu', name: 'אוניברסיטת בן-גוריון', type: 'university', logo_url: 'https://logo.clearbit.com/bgu.ac.il', website_url: 'https://in.bgu.ac.il/engn/ee/Pages/default.aspx' },
            faculty: { id: 'fac_bgu_eng', name: 'הפקולטה למדעי ההנדסה' }
        },
        admission: {
            id: 'adm_bgu_ee',
            program_id: 'prog_bgu_ee',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "סכם הנדסה",
                        AND: [{ type: "sekhem_eng", operator: ">=", value: 540, label: "סכם הנדסה 540+" }]
                    }
                ]
            }
        }
    },

    // --- Tel Aviv University ---
    {
        program: {
            id: 'prog_tau_cs',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'בית הספר למדעי המחשב באוניברסיטת תל אביב הוא מהמובילים בעולם. התוכנית מעניקה בסיס מתמטי וחשובי רחב, המאפשר לבוגרים להתמודד עם אתגרי המחר בטכנולוגיה.',
            career_opportunities: 'משרות מחקר ופיתוח בחברות FAANG (Google, Meta, Apple), ניהול מוצר טכנולוגי.',
            institution: { id: 'inst_tau', name: 'אוניברסיטת תל אביב', type: 'university', logo_url: 'https://logo.clearbit.com/tau.ac.il', website_url: 'https://cs.tau.ac.il/' },
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
                        AND: [{ type: "sekhem", operator: ">=", value: 730, label: "ציון התאמה 730+" }]
                    }
                ]
            }
        }
    },
    {
        program: {
            id: 'prog_tau_med',
            name: 'רפואה',
            degree_type: 'MD',
            duration_years: 7,
            description: 'הפקולטה לרפואה ע"ש סאקלר מכשירה את דור העתיד של הרופאים בישראל. הלימודים משלבים מחקר קליני מתקדם עם התנסות בבתי החולים המובילים במרכז.',
            career_opportunities: 'רופאים בבתי חולים ובקהילה, חוקרים רפואיים, ניהול מערכות בריאות.',
            institution: { id: 'inst_tau', name: 'אוניברסיטת תל אביב', type: 'university', logo_url: 'https://logo.clearbit.com/tau.ac.il', website_url: 'https://med.tau.ac.il/' },
            faculty: { id: 'fac_tau_med', name: 'הפקולטה לרפואה' }
        },
        admission: {
            id: 'adm_tau_med',
            program_id: 'prog_tau_med',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "סכם רפואה",
                        AND: [
                            { type: "sekhem", operator: ">=", value: 740, label: "ציון התאמה 740+" },
                            { type: "psychometric", operator: ">=", value: 740, label: "פסיכומטרי 740+" }
                        ]
                    }
                ]
            }
        }
    },

    // --- Hebrew University ---
    {
        program: {
            id: 'prog_huji_cs',
            name: 'הנדסת מחשבים',
            degree_type: 'B.Sc',
            duration_years: 4,
            description: 'התוכנית להנדסת מחשבים באוניברסיטה העברית משלבת לימודי מדעי המחשב עם הנדסת חשמל.',
            career_opportunities: 'פיתוח שבבים (VLSI), מערכות משובצות מחשב (Embedded), רובוטיקה.',
            institution: { id: 'inst_huji', name: 'האוניברסיטה העברית', type: 'university', logo_url: 'https://logo.clearbit.com/huji.ac.il', website_url: 'https://en.cs.huji.ac.il/' },
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
            id: 'prog_huji_ppe',
            name: 'פילוסופיה, כלכלה ומדע המדינה (פכ"מ)',
            degree_type: 'BA',
            duration_years: 3,
            description: 'תוכנית מצטיינים יוקרתית המכשירה מנהיגים למגזר הציבורי ולתפקידי מפתח במשק.',
            career_opportunities: 'מגזר ציבורי, משרד האוצר, עיתונות, ניהול בכיר, מכוני מחקר ומדיניות.',
            institution: { id: 'inst_huji', name: 'האוניברסיטה העברית', type: 'university', logo_url: 'https://logo.clearbit.com/huji.ac.il', website_url: 'https://ppe.huji.ac.il/' },
            faculty: { id: 'fac_huji_soc', name: 'הפקולטה למדעי החברה' }
        },
        admission: {
            id: 'adm_huji_ppe',
            program_id: 'prog_huji_ppe',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "קבלה משוקללת",
                        AND: [{ type: "sekhem", operator: ">=", value: 24, label: "בגרות ופסיכומטרי (סכם מיוחד)" }]
                    }
                ]
            }
        }
    },

    // --- Technion ---
    {
        program: {
            id: 'prog_tech_cs',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'המסלול המרכזי למדעי המחשב בטכניון. מקנה ידע תיאורטי ומעשי רחב. מצוינות אקדמית וחדשנות טכנולוגית.',
            career_opportunities: 'הובלה טכנולוגית (CTO), ארכיטקטורת תוכנה, מחקר באלגוריתמים.',
            institution: { id: 'inst_tech', name: 'הטכניון', type: 'university', logo_url: 'https://logo.clearbit.com/technion.ac.il', website_url: 'https://cs.technion.ac.il/' },
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
            id: 'prog_tech_arch',
            name: 'אדריכלות',
            degree_type: 'B.Arch',
            duration_years: 5,
            description: 'הפקולטה לארכיטקטורה ובינוי ערים בטכניון היא הוותיקה בארץ. הלימודים משלבים תכנון, עיצוב, טכנולוגיה והיסטוריה.',
            career_opportunities: 'אדריכלים רשומים, מתכנני ערים, עיצוב פנים, שימור מבנים.',
            institution: { id: 'inst_tech', name: 'הטכניון', type: 'university', logo_url: 'https://logo.clearbit.com/technion.ac.il', website_url: 'https://arch.technion.ac.il/' },
            faculty: { id: 'fac_tech_arch', name: 'הפקולטה לארכיטקטורה' }
        },
        admission: {
            id: 'adm_tech_arch',
            program_id: 'prog_tech_arch',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "סכם + בחינת מיון",
                        AND: [
                            { type: "sekhem", operator: ">=", value: 87, label: "סכם 87+" },
                            { type: "exam_arch", operator: ">=", value: 1, label: "מעבר בחינת מיון" }
                        ]
                    }
                ]
            }
        }
    },

    // --- Bar Ilan ---
    {
        program: {
            id: 'prog_biu_llb',
            name: 'משפטים',
            degree_type: 'LL.B',
            duration_years: 3.5,
            description: 'לימודים באווירה ייחודית עם דגש על משפט עברי, מסחרי וציבורי.',
            career_opportunities: 'עריכת דין, ייעוץ משפטי, שפיטה, אקדמיה.',
            institution: { id: 'inst_biu', name: 'אוניברסיטת בר אילן', type: 'university', logo_url: 'https://logo.clearbit.com/biu.ac.il', website_url: 'https://law.biu.ac.il/' },
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
    },

    // --- Reichman University (IDC) ---
    {
        program: {
            id: 'prog_idc_business',
            name: 'מנהל עסקים',
            degree_type: 'BA',
            duration_years: 3,
            description: 'בית הספר למנהל עסקים באוניברסיטת רייכמן שם דגש על יזמות וחדשנות.',
            career_opportunities: 'ניהול, שיווק, פיננסים, יזמות סטארט-אפ.',
            institution: { id: 'inst_reichman', name: 'אוניברסיטת רייכמן', type: 'university', logo_url: 'https://logo.clearbit.com/runi.ac.il', website_url: 'https://www.runi.ac.il/' },
            faculty: { id: 'fac_idc_bus', name: 'ביה"ס למנהל עסקים' }
        },
        admission: {
            id: 'adm_idc_bus',
            program_id: 'prog_idc_business',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "ממוצע בגרות + ראיון",
                        AND: [{ type: "bagrut_avg_weighted", operator: ">=", value: 100, label: "בגרות משוקללת 100+" }]
                    }
                ]
            }
        }
    },

    // --- University of Haifa ---
    {
        program: {
            id: 'prog_haifa_psych',
            name: 'פסיכולוגיה',
            degree_type: 'BA',
            duration_years: 3,
            description: 'החוג לפסיכולוגיה באוניברסיטת חיפה הוא מהוותיקים והגדולים בארץ.',
            career_opportunities: 'פסיכולוגיה קלינית (לאחר תואר שני), ייעוץ ארגוני, משאבי אנוש.',
            institution: { id: 'inst_haifa', name: 'אוניברסיטת חיפה', type: 'university', logo_url: 'https://logo.clearbit.com/haifa.ac.il', website_url: 'https://psychology.haifa.ac.il/' },
            faculty: { id: 'fac_haifa_soc', name: 'הפקולטה למדעי החברה' }
        },
        admission: {
            id: 'adm_haifa_psych',
            program_id: 'prog_haifa_psych',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "חתך קבלה",
                        AND: [{ type: "sekhem", operator: ">=", value: 680, label: "סכם 680+" }]
                    }
                ]
            }
        }
    },

    // --- Ariel University ---
    {
        program: {
            id: 'prog_ariel_civil',
            name: 'הנדסה אזרחית',
            degree_type: 'B.Sc',
            duration_years: 4,
            description: 'לימודי הנדסה אזרחית באריאל מתמקדים בתכנון מבנים, ניהול בנייה ותשתיות.',
            career_opportunities: 'קונסטרוקציה, ניהול פרויקטים בבנייה, הנדסת כבישים.',
            institution: { id: 'inst_ariel', name: 'אוניברסיטת אריאל', type: 'university', logo_url: 'https://logo.clearbit.com/ariel.ac.il', website_url: 'https://www.ariel.ac.il/' },
            faculty: { id: 'fac_ariel_eng', name: 'הפקולטה להנדסה' }
        },
        admission: {
            id: 'adm_ariel_civil',
            program_id: 'prog_ariel_civil',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "בגרות ופסיכומטרי",
                        AND: [
                            { type: "psychometric", operator: ">=", value: 580, label: "פסיכומטרי 580+" },
                            { type: "math_bagrut", operator: ">=", value: 4, label: "מתמטיקה 4 יח״ל" }
                        ]
                    }
                ]
            }
        }
    },

    // --- Open University ---
    {
        program: {
            id: 'prog_open_psych',
            name: 'פסיכולוגיה',
            degree_type: 'BA',
            duration_years: 3,
            description: 'האוניברסיטה הפתוחה מאפשרת לימודים גמישים ברמה אקדמית גבוהה ללא תנאי קבלה מוקדמים.',
            career_opportunities: 'המשך לתארים מתקדמים, עבודה בחינוך, משאבי אנוש ועוד.',
            institution: { id: 'inst_open', name: 'האוניברסיטה הפתוחה', type: 'university', logo_url: 'https://logo.clearbit.com/openu.ac.il', website_url: 'https://www.openu.ac.il/' },
            faculty: { id: 'fac_open_soc', name: 'מדעי החברה והרוח' }
        },
        admission: {
            id: 'adm_open_psych',
            program_id: 'prog_open_psych',
            year: 2026,
            status: 'published',
            logic_rules: {
                OR: [
                    {
                        name: "קבלה פתוחה",
                        AND: [],
                        label: "ללא תנאי קבלה מוקדמים"
                    }
                ]
            }
        }
    }
];
