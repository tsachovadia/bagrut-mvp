import { motion } from 'framer-motion';
import { trackEvent } from '../../utils/gtm';

interface ConversationalHeroProps {
    onStartUpload: () => void;
    onManual: () => void;
}

export function ConversationalHero({ onStartUpload, onManual }: ConversationalHeroProps) {

    // Simple handler to trigger the file input (reusing existing logic if possible, 
    // or we can implement a drag-zone here later. For now, let's keep it simple: 
    // "Yes" -> Opens the existing upload flow or manual flow but pre-selected)

    // Actually, per the plan, "Yes" -> Drag & Drop Zone. "No" -> Wizard/Ministry Site.
    // To keep implementation fast, "Yes" triggers the same 'onStart' effectively, 
    // but maybe we pass a flag to open the upload tab directly.

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4 text-center">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-12 w-full max-w-3xl"
            >
                <div className="mb-8">
                    <span className="text-5xl md:text-6xl mb-4 block">📄</span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
                        יש לך קובץ ציונים (PDF)?
                    </h2>
                    <p className="text-lg text-gray-600 font-medium">
                        הדרך הכי מהירה לגלות את סיכויי הקבלה שלך.
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
                    {/* Option 1: Have PDF - Primary Action */}
                    <button
                        onClick={() => {
                            trackEvent('hero_action', { action: 'upload_pdf' });
                            onStartUpload();
                        }}
                        className="group relative flex items-center justify-between p-4 bg-[#1877F2] hover:bg-[#1559B2] text-white rounded-2xl shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-[1.02] border border-blue-600"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <div className="text-right">
                                <span className="block text-lg font-bold">כן, יש לי!</span>
                                <span className="text-xs text-blue-100 opacity-90">גרור אותו למחשבון</span>
                            </div>
                        </div>
                        <div className="bg-white/10 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                    </button>

                    {/* Option 2: Ministry Link - Secondary Action */}
                    <a
                        href="https://students.education.gov.il/matriculation-exams/grades"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('hero_action', { action: 'ministry_link' })}
                        className="group relative flex items-center justify-between p-4 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-300 hover:scale-[1.02]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-100 p-2 rounded-xl text-gray-500 group-hover:text-[#1877F2] transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="text-right">
                                <span className="block text-lg font-bold">אין לי את הקובץ</span>
                                <span className="text-xs text-gray-500">קח אותי למשרד החינוך להנפיק</span>
                            </div>
                        </div>
                        <div className="text-gray-300 group-hover:text-[#1877F2] transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                    </a>

                    {/* Option 3: Manual Entry - Tertiary Action */}
                    <button
                        onClick={() => {
                            trackEvent('hero_action', { action: 'manual_entry' });
                            onManual();
                        }}
                        className="text-sm text-gray-400 hover:text-gray-600 font-medium py-2 transition-colors underline decoration-gray-300 hover:decoration-gray-500 underline-offset-4"
                    >
                        אני מעדיף להקליד ידנית
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-400">
                        * אל דאגה, אנחנו מסבירים איך מורידים את הקובץ בשניות
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
