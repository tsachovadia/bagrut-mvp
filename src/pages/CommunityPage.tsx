import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Users, MessageCircle, Send, Facebook, ExternalLink, ArrowLeft, Laptop, Stethoscope, Scale, Brain, Briefcase, Palette } from 'lucide-react';

export function CommunityPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-[#24292e] text-white py-20 px-4">
                    <div className="container mx-auto max-w-4xl text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6 text-gray-200">
                            <Users size={18} />
                            <span className="font-medium">הקהילה שלנו</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            לא לומדים <span className="text-brand-purple-300">לבד.</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                            הצטרפו לאלפי תלמידים שכבר נעזרים בקהילות שלנו כדי לקבל אנרגיות, טיפים, ועדכונים שוטפים.
                        </p>
                    </div>
                </div>

                {/* Communities Grid */}
                <div className="py-20 px-4 container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">מצאו את הקהילה שלכם</h2>
                        <p className="text-xl text-gray-600">הצטרפו לקבוצות הדיון הממוקדות שלנו בטלגרם</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Tech & Engineering */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Laptop size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">הייטק והנדסה</h3>
                            </div>
                            <p className="text-gray-600 mb-6 text-sm">
                                מדעי המחשב, הנדסת חשמל, נתונים, סייבר.
                                <br />
                                <span className="text-xs text-gray-400 mt-1 block">מתאים למועמדי טכניון, בן-גוריון, ת"א</span>
                            </p>
                            <a href="#" className="w-full inline-flex justify-center items-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                                <Send size={16} />
                                <span>הצטרפות לקהילה</span>
                            </a>
                        </div>

                        {/* Medicine & Health */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                                    <Stethoscope size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">רפואה ובריאות</h3>
                            </div>
                            <p className="text-gray-600 mb-6 text-sm">
                                רפואה (7-שנתי/4-שנתי), סיעוד, רוקחות.
                                <br />
                                <span className="text-xs text-gray-400 mt-1 block">קהילה למועמדים עם סכם גבוה</span>
                            </p>
                            <a href="#" className="w-full inline-flex justify-center items-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                                <Send size={16} />
                                <span>הצטרפות לקהילה</span>
                            </a>
                        </div>

                        {/* Law & Government */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                    <Scale size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">משפטים וממשל</h3>
                            </div>
                            <p className="text-gray-600 mb-6 text-sm">
                                משפטים, פכ"מ, מדעי המדינה, יחסים בינלאומיים.
                                <br />
                                <span className="text-xs text-gray-400 mt-1 block">דיונים על התמחויות ומשרדים</span>
                            </p>
                            <a href="#" className="w-full inline-flex justify-center items-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                                <Send size={16} />
                                <span>הצטרפות לקהילה</span>
                            </a>
                        </div>

                        {/* Mind & Society */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                                    <Brain size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">נפש וחברה</h3>
                            </div>
                            <p className="text-gray-600 mb-6 text-sm">
                                פסיכולוגיה, עבודה סוציאלית, סוציולוגיה.
                                <br />
                                <span className="text-xs text-gray-400 mt-1 block">תמיכה בתהליך הקבלה לתואר שני</span>
                            </p>
                            <a href="#" className="w-full inline-flex justify-center items-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                                <Send size={16} />
                                <span>הצטרפות לקהילה</span>
                            </a>
                        </div>

                        {/* Business & Management */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                    <Briefcase size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">ניהול ועסקים</h3>
                            </div>
                            <p className="text-gray-600 mb-6 text-sm">
                                מנהל עסקים, כלכלה, חשבונאות, יזמות.
                                <br />
                                <span className="text-xs text-gray-400 mt-1 block">נטוורקינג וקריירה</span>
                            </p>
                            <a href="#" className="w-full inline-flex justify-center items-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                                <Send size={16} />
                                <span>הצטרפות לקהילה</span>
                            </a>
                        </div>

                        {/* Design & Architecture */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                                    <Palette size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">עיצוב ואדריכלות</h3>
                            </div>
                            <p className="text-gray-600 mb-6 text-sm">
                                אדריכלות, תקשורת חזותית, עיצוב תעשייתי.
                                <br />
                                <span className="text-xs text-gray-400 mt-1 block">תיק עבודות ומבחני כניסה</span>
                            </p>
                            <a href="#" className="w-full inline-flex justify-center items-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                                <Send size={16} />
                                <span>הצטרפות לקהילה</span>
                            </a>
                        </div>
                    </div>

                    {/* General Updates Link */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-500 mb-4">עדיין מתלבטים? הצטרפו לקבוצת העדכונים השקטה שלנו</p>
                        <a
                            href="https://chat.whatsapp.com/F3Kc5oNu2o46YNdGHxHTYm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-green-600 font-bold hover:text-green-700 transition-colors"
                        >
                            <MessageCircle size={20} />
                            <span>כניסה לקבוצת העדכונים (WhatsApp)</span>
                        </a>
                    </div>
                </div>

                {/* Social Proof / Numbers (Placeholder) */}
                <div className="bg-white py-16 border-t border-gray-100">
                    <div className="container mx-auto max-w-4xl text-center px-4">
                        <h2 className="text-3xl font-bold mb-12">למה להצטרף?</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <div className="text-4xl font-black text-brand-purple-600 mb-2">1,500+</div>
                                <div className="text-gray-600 font-medium">חברים בקהילה</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black text-brand-purple-600 mb-2">24/7</div>
                                <div className="text-gray-600 font-medium">מענה מחברים</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black text-brand-purple-600 mb-2">100%</div>
                                <div className="text-gray-600 font-medium">בחינם</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black text-brand-purple-600 mb-2">∞</div>
                                <div className="text-gray-600 font-medium">מוטיבציה</div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
