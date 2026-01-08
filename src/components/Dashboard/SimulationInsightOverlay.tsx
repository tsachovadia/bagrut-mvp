import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Sparkles, TrendingUp, TrendingDown, Target, ChevronDown, ChevronUp } from 'lucide-react';
import type { SimulationInsight } from '../../utils/calculation-bridge';

interface Props {
    insights: SimulationInsight[];
    isVisible: boolean;
}

export const SimulationInsightOverlay = ({ insights, isVisible }: Props) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <AnimatePresence>
            {isVisible && insights.length > 0 && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="mx-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-t border-white/50 ring-1 ring-black/5 overflow-hidden pointer-events-auto"
                    >
                        {/* Header Trigger */}
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-50 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-indigo-600" />
                                </div>
                                <span className="text-sm font-bold text-gray-800">
                                    ניתוח שינויים בזמן אמת
                                    {!isExpanded && (
                                        <span className="mr-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-full">
                                            {insights.length} תובנות
                                        </span>
                                    )}
                                </span>
                            </div>
                            <button className="text-gray-400">
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                            </button>
                        </div>

                        <AnimatePresence initial={false}>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="space-y-3 px-4 pb-4 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                                        {insights.map((insight, idx) => (
                                            <div key={idx} className="flex items-start gap-3 text-sm p-2 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                                <div className={`mt-0.5 p-1 rounded-full ${insight.impact === 'positive' ? 'bg-green-100 text-green-600' :
                                                    insight.impact === 'negative' ? 'bg-red-100 text-red-600' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {insight.impact === 'positive' ? <TrendingUp size={14} /> :
                                                        insight.impact === 'negative' ? <TrendingDown size={14} /> :
                                                            <Target size={14} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-gray-700 leading-snug">{insight.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

