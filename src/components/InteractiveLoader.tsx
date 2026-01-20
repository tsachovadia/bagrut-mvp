import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

const QUESTIONS = [
    {
        id: 'interest',
        text: 'מה הכי מעניין אותך?',
        options: ['טכנולוגיה ומחשבים', 'עבודה עם אנשים', 'פיקוד והדרכה', 'מודיעין ומחקר']
    },
    {
        id: 'environment',
        text: 'סביבת עבודה מועדפת?',
        options: ['משרד ממוזג', 'שטח וטבע', 'בסיס סגור', 'יומיות קל"ב']
    },
    {
        id: 'region',
        text: 'איפה תרצה לשרת?',
        options: ['צפון', 'מרכז', 'דרום', 'לא משנה לי']
    }
];

export const InteractiveLoader = () => {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleAnswer = (answer: string) => {
        if (isTransitioning) return;

        setAnswers(prev => ({ ...prev, [QUESTIONS[currentQIndex].id]: answer }));
        setIsTransitioning(true);

        setTimeout(() => {
            if (currentQIndex < QUESTIONS.length - 1) {
                setCurrentQIndex(prev => prev + 1);
                setIsTransitioning(false);
            } else {
                // Done with questions, just show generic loading
            }
        }, 600);
    };

    const currentQuestion = QUESTIONS[currentQIndex];
    const isDone = currentQIndex >= QUESTIONS.length - 1 && isTransitioning;

    return (
        <div className="w-full max-w-md mx-auto text-center space-y-6">
            <div className="flex justify-center mb-6">
                <Loader2 className="w-12 h-12 text-brand-purple-600 animate-spin" />
            </div>

            <div className="relative min-h-[200px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {!isDone ? (
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-6">
                                {currentQuestion.text}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {currentQuestion.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswer(option)}
                                        className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200
                                            ${answers[currentQuestion.id] === option
                                                ? 'bg-brand-purple-600 text-white border-brand-purple-600 shadow-lg scale-105'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-brand-purple-300 hover:bg-brand-purple-50'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center space-y-4"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green-100 rounded-full mb-4">
                                <Check className="w-8 h-8 text-brand-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">תודה! אנחנו מסיימים לעבד את הנתונים...</h3>
                            <p className="text-gray-500">מיד הכל יהיה מוכן</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <p className="text-xs text-gray-400 mt-8">
                בזמן שאנחנו מפענחים את הציונים, בוא נכיר אותך קצת יותר
            </p>
        </div>
    );
};
