import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Handshake, Target, Users, Zap, Mail, Phone, ArrowLeft } from 'lucide-react';

export function CollaborationsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-brand-purple-900 to-indigo-900 text-white py-20 px-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="container mx-auto max-w-4xl text-center relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6 text-purple-100 border border-white/20">
                            <Handshake size={18} />
                            <span className="font-medium">שיתופי פעולה</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            בואו נבנה את העתיד <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">ביחד.</span>
                        </h1>
                        <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                            אנחנו מחברים בין מוסדות אקדמיים, חברות וטכנולוגיה לבין הדור הבא של הסטודנטים בישראל. הצטרפו אלינו למהפכה.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <a
                                href="mailto:contact@mitlabtim.co.il"
                                className="inline-flex justify-center items-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                <Mail size={20} />
                                <span>צרו קשר במייל</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Benefits Grid */}
                <div className="py-20 px-4 container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">למה לשתף איתנו פעולה?</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Audience */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-purple-100 text-brand-purple-600 rounded-xl flex items-center justify-center mb-6">
                                <Users size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">גישה לקהל מדויק</h3>
                            <p className="text-gray-600 leading-relaxed">
                                אלפי תלמידי תיכון ומשוחררים שנמצאים בדיוק בצומת קבלת ההחלטות לגבי העתיד האקדמי שלהם.
                            </p>
                        </div>

                        {/* Technology */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">חדשנות טכנולוגית</h3>
                            <p className="text-gray-600 leading-relaxed">
                                הפלטפורמה שלנו משתמשת בנתונים ובאלגוריתמים חכמים כדי להתאים לכל משתמש את המסלול הנכון ביותר עבורו.
                            </p>
                        </div>

                        {/* Brand */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-6">
                                <Target size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">חיבור למותג מוביל</h3>
                            <p className="text-gray-600 leading-relaxed">
                                מתלבטים נתפס כגורם אובייקטיבי ומקצועי, ושיתוף פעולה איתנו מחזק את האמינות שלכם בקרב קהל היעד.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-gray-100 py-20 px-4">
                    <div className="container mx-auto max-w-2xl bg-white rounded-3xl p-10 shadow-sm border border-gray-200 text-center">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900">בואו נדבר תכלס</h2>
                        <p className="text-gray-600 mb-10 text-lg">
                            יש לכם רעיון לשיתוף פעולה? רוצים לפרסם אצלנו?
                            <br />
                            אנחנו זמינים לכל שאלה.
                        </p>

                        <div className="flex flex-col gap-4 items-center">
                            <a href="mailto:contact@mitlabtim.co.il" className="flex items-center gap-3 text-xl font-medium text-gray-800 hover:text-brand-purple-600 transition-colors bg-gray-50 px-8 py-4 rounded-xl w-full justify-center border border-gray-200 hover:border-brand-purple-200">
                                <Mail className="text-brand-purple-500" />
                                contact@mitlabtim.co.il
                            </a>
                            {/* Placeholder for phone if needed later
                            <a href="tel:+972500000000" className="flex items-center gap-3 text-xl font-medium text-gray-800 hover:text-brand-purple-600 transition-colors bg-gray-50 px-8 py-4 rounded-xl w-full justify-center border border-gray-200 hover:border-brand-purple-200">
                                <Phone className="text-brand-purple-500" />
                                050-000-0000
                            </a>
                            */}
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
