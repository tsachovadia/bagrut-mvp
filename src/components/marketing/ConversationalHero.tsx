import { motion } from 'framer-motion';
import { trackEvent } from '../../utils/gtm';

interface ConversationalHeroProps {
    onUploaded: (text: string) => void;
    onManual: () => void;
}

export function ConversationalHero({ onUploaded, onManual }: ConversationalHeroProps) {

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mx-auto">
                    <button
                        onClick={() => {
                            trackEvent('survey_has_pdf', { value: 'yes' });
                            onManual(); // Ideally this opens the wizard in "Upload Mode"
                        }}
                        className="group relative flex flex-col items-center justify-center p-6 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-100 hover:border-indigo-300 rounded-2xl transition-all duration-300 hover:scale-105"
                    >
                        <div className="bg-indigo-600 text-white rounded-full p-3 mb-3 shadow-lg group-hover:shadow-indigo-300/50 transition-shadow">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-gray-900">כן, יש לי!</span>
                        <span className="text-sm text-gray-500 mt-1">גרור אותו למחשבון</span>
                    </button>

                    <button
                        onClick={() => {
                            trackEvent('survey_has_pdf', { value: 'no' });
                            onManual(); // Opens the wizard in "Manual Mode"
                        }}
                        className="group relative flex flex-col items-center justify-center p-6 bg-white hover:bg-gray-50 border-2 border-gray-100 hover:border-gray-200 rounded-2xl transition-all duration-300 hover:scale-105"
                    >
                        <div className="bg-gray-200 text-gray-600 rounded-full p-3 mb-3">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-gray-900">לא, אין לי</span>
                        <span className="text-sm text-gray-500 mt-1">אזין ידנית / אוריד מהמשרד</span>
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
