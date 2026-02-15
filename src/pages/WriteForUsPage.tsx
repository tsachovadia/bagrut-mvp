import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PenTool, Target, Users, CheckCircle, ArrowLeft } from 'lucide-react';

export function WriteForUsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-brand-purple-900 text-white py-20 px-4">
                    <div className="container mx-auto max-w-4xl text-center">
                        <div className="inline-flex items-center gap-2 bg-brand-purple-800 px-4 py-2 rounded-full mb-6 text-brand-purple-200">
                            <PenTool size={18} />
                            <span className="font-medium">הצטרפו לצוות הכותבים שלנו</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            שתפו את הידע שלכם עם <br />
                            <span className="text-brand-purple-300">אלפי תלמידים</span>
                        </h1>
                        <p className="text-xl text-brand-purple-100 max-w-2xl mx-auto mb-10">
                            אנחנו מחפשים מומחים, מורים וסטודנטים מצטיינים שיעזרו לנו לבנות את מאגר הידע הגדול ביותר לתלמידי תיכון בישראל.
                        </p>
                        <a
                            href="https://t.me/MitlabtimBot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white text-brand-purple-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-purple-50 transition-colors shadow-lg shadow-brand-purple-900/50"
                        >
                            <span>הגשת מועמדות לכתיבה</span>
                            <ArrowLeft size={20} />
                        </a>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="py-20 px-4 container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-center mb-16">למה כדאי לכתוב אצל מתלבטים?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Target,
                                title: "חשיפה ממוקדת",
                                description: "המאמרים שלכם יגיעו לאלפי תלמידים שצמאים לידע שלכם, דרך האתר וערוצי הטלגרם שלנו."
                            },
                            {
                                icon: Users,
                                title: "בניית סמכות מקצועית",
                                description: "כל מאמר כולל קרדיט מלא, תמונה וביוגרפיה, וממצב אתכם כמומחים בתחומכם."
                            },
                            {
                                icon: CheckCircle,
                                title: "תרומה לקהילה",
                                description: "עזרו לתלמידים להצליח בבגרויות וקבלו סיפוק אדיר מהידיעה שאתם משפיעים על העתיד שלהם."
                            }
                        ].map((benefit, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-16 h-16 bg-brand-purple-50 text-brand-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <benefit.icon size={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Process Section */}
                <div className="bg-white py-20 px-4 border-t border-gray-100">
                    <div className="container mx-auto max-w-4xl">
                        <h2 className="text-3xl font-bold text-center mb-16">איך זה עובד?</h2>
                        <div className="space-y-8">
                            {[
                                { step: 1, title: "שליחת רעיון", text: "ממלאים את טופס ההגשה הקצר עם רעיון למאמר או נושא שרוצים לכתוב עליו." },
                                { step: 2, title: "אישור ומשוב", text: "אנחנו עוברים על הרעיון, נותנים פידבק ומאשרים את הכתיבה." },
                                { step: 3, title: "כתיבה ועריכה", text: "אתם כותבים את המאמר, ואנחנו עוזרים בעריכה לשונית ועיצוב." },
                                { step: 4, title: "פרסום והפצה", text: "המאמר עולה לאוויר ומופץ לכל הקהילה שלנו!" }
                            ].map((item) => (
                                <div key={item.step} className="flex gap-6 items-start">
                                    <div className="flex-shrink-0 w-12 h-12 bg-brand-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                        <p className="text-gray-600">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
