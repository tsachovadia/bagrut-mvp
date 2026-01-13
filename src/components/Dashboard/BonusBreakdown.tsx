import type { UniversityBonusStatus } from '../../utils/bonuses';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface BonusBreakdownProps {
    bonuses: UniversityBonusStatus[];
}

export function BonusBreakdown({ bonuses }: BonusBreakdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Usually we show the bonuses for the first university or aggregate
    // For MVP, since calculation logic is similar, we can just pick one representative or show all
    // Let's show Tel Aviv as a representative sample or aggregated unique bonuses?
    // User asked "why Civics gives 20 points", suggesting they want to see specifically WHAT gives points.

    // Let's take the university with the HIGHEST bonus to show "Max Potential"
    const bestBonus = bonuses.reduce((prev, current) =>
        (current.totalBonus > prev.totalBonus) ? current : prev
        , bonuses[0]);

    if (!bestBonus || bestBonus.totalBonus === 0) return null;

    return (
        <div className="bg-white/50 rounded-xl border border-white/60 p-4 mt-4 shadow-sm backdrop-blur-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        +{bestBonus.totalBonus} בונוס
                    </span>
                    <span>איך הגענו לזה? (לפי {bestBonus.university})</span>
                </div>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 space-y-2">
                            {bestBonus.details.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs text-gray-600 bg-white/40 p-2 rounded-lg">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-gray-800">{item.subject}</span>
                                        <span className="text-gray-400">({item.units} יח"ל)</span>
                                    </div>
                                    <span className="font-mono font-medium text-green-600 bg-green-50 px-1.5 rounded">
                                        +{item.points}
                                    </span>
                                </div>
                            ))}
                            <div className="text-[10px] text-gray-400 mt-2 text-center">
                                * הבונוס עשוי להשתנות בין מוסדות שונים. הצגנו את החישוב המחמיר/הנפוץ.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
