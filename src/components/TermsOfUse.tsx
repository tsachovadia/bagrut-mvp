
import React from 'react';
import { ArrowRight } from 'lucide-react';

export function TermsOfUse({ onBack }: { onBack: () => void }) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right" dir="rtl">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="mb-8 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
                <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">חזרה לדף הבית</span>
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
                <header className="border-b border-gray-100 pb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">תנאי שימוש באתר</h1>
                    <p className="text-gray-500 text-lg">עודכן לאחרונה: ינואר 2025</p>
                </header>

                <section className="space-y-6 text-gray-700 leading-relaxed">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. כללי</h2>
                        <p>
                            ברוכים הבאים לאתר "מתלבטים בלימודים" בכתובת mitlabltim.co.il (להלן: "האתר").
                            השימוש באתר ובשירותים המוצעים בו מעיד על הסכמתך לתנאים אלו. אנא קרא אותם בעיון.
                            האתר מיועד לשימוש אישי בלבד, ומטרתו לספק מידע וכלים עזר למועמדים ללימודים אקדמיים.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. הגבלת אחריות ודיוק המידע</h2>
                        <p>
                            הכלים והמידע באתר, לרבות מחשבוני הקבלה, סיכויי הקבלה וחישובי הבונוסים, מבוססים על הערכות ונתונים שנאספו ממקורות שונים.
                            אנו עושים מאמץ לשמור על המידע עדכני ומדויק, אך <strong>אין לראות בו מידע רשמי או מחייב</strong>.
                        </p>
                        <p className="mt-2">
                            <span className="font-semibold">חשוב להבהיר:</span> תנאי הקבלה במוסדות הלימוד עשויים להשתנות מעת לעת ללא הודעה מוקדמת.
                            האחריות הבלעדית לבדיקת תנאי הקבלה הסופיים והרשמיים מוטלת על המשתמש, ויש לבצע זאת ישירות מול המוסדות האקדמיים הרלוונטיים.
                            צוות "מתלבטים בלימודים" לא יישא באחריות לכל אי-התאמה, טעות בחישוב, או נזק (ישיר או עקיף) שייגרם כתוצאה מהסתמכות על המידע באתר.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. קניין רוחני</h2>
                        <p>
                            כל הזכויות על התכנים, העיצוב, הקוד, בסיסי הנתונים והכלים המופיעים באתר שמורות ל"מתלבטים בלימודים".
                            אין להעתיק, לשכפל, להפיץ, לשווק או להשתמש במידע ובתכנים המופיעים באתר לצרכים מסחריים ללא קבלת אישור מפורש בכתב מאיתנו.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. פרטיות ומסירת מידע</h2>
                        <p>
                            אנו מכבדים את פרטיות המשתמשים. השימוש באתר עשוי לכלול איסוף מידע אנונימי וסטטיסטי לשיפור השירות.
                            במידה ותבחר להשאיר פרטים ליצירת קשר או לקבלת ייעוץ, פרטיך יישמרו במאגר המידע שלנו.
                        </p>
                        <p className="mt-2">
                            בעת השארת פרטים, הינך מסכים כי נוכל להעביר את פרטי הקשר שלך לשותפים עסקיים רלוונטיים (כגון מוסדות לימוד, מכוני ייעוץ או הכנה למבחנים) על מנת שיוכלו להציע לך שירותים המתאימים לתחומי העניין שלך.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. קישורים לצד שלישי</h2>
                        <p>
                            האתר עשוי להכיל קישורים לאתרים חיצוניים שאינם בשליטתנו. איננו אחראים לתוכן, למדיניות הפרטיות או לתנאי השימוש של אתרים אלו, והשימוש בהם הוא על אחריות המשתמש בלבד.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">6. שינויים בתנאי השימוש</h2>
                        <p>
                            אנו שומרים לעצמנו את הזכות לעדכן או לשנות את תנאי השימוש בכל עת. הנוסח המחייב הוא זה המפורסם באתר במועד השימוש.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">7. דין וסמכות שיפוט</h2>
                        <p>
                            על השימוש באתר יחולו דיני מדינת ישראל בלבד. סמכות השיפוט הבלעדית בכל עניין הנוגע לאתר נתונה לבתי המשפט המוסמכים במחוז תל אביב.
                        </p>
                    </div>

                    <div className="pt-6 border-t border-gray-100 mt-8">
                        <p className="text-gray-600">
                            יש לך שאלות נוספות? ניתן ליצור איתנו קשר דרך עמוד הקהילה בפייסבוק או במייל.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
