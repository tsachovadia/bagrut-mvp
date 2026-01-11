
import { motion } from 'framer-motion';
import { Loader2, Scan, FileText, CheckCircle2 } from 'lucide-react';

interface SmartLoadingPopupProps {
    phase: 'scanning' | 'processing' | 'complete';
}

export const SmartLoadingPopup = ({ phase }: SmartLoadingPopupProps) => {
    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
            <h3 className="text-center font-bold text-lg text-gray-800">
                מעבד את הגיליון שלך...
            </h3>

            {/* Steps Container */}
            <div className="space-y-4 relative">

                {/* Connecting Line */}
                <div className="absolute top-4 right-5 bottom-4 w-0.5 bg-gray-100 -z-10" />

                {/* Step 1: Scanning (OCR) */}
                <div className={`flex items-center gap-4 transition-colors duration-500 ${phase !== 'scanning' ? 'opacity-50' : 'opacity-100'}`}>
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300
                        ${phase === 'scanning' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-green-500 bg-green-50 text-green-600'}
                    `}>
                        {phase === 'scanning' ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                <Scan className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <CheckCircle2 className="w-5 h-5" />
                        )}
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-gray-900">סורק את המסמך</p>
                        <p className="text-xs text-gray-500">מזהה טקסט ומבנה (OCR)</p>
                    </div>
                </div>

                {/* Step 2: Processing (Normalization) */}
                <div className={`flex items-center gap-4 transition-colors duration-500 ${phase === 'scanning' ? 'opacity-40' : 'opacity-100'}`}>
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300
                        ${phase === 'processing' ? 'border-blue-500 bg-blue-50 text-blue-600' :
                            phase === 'complete' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 bg-gray-50 text-gray-400'}
                    `}>
                        {phase === 'processing' ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                <Loader2 className="w-5 h-5" />
                            </motion.div>
                        ) : phase === 'complete' ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            <FileText className="w-5 h-5" />
                        )}
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-gray-900">מפענח ציונים</p>
                        <p className="text-xs text-gray-500">ממיר לנתונים ומחשב ממוצעים</p>
                    </div>
                </div>

            </div>

            {/* Footer Text */}
            <p className="text-center text-xs text-gray-400 pt-2">
                מופעל על ידי Gemini 2.0 Flash
            </p>
        </div>
    );
};
