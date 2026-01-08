
import React, { useMemo } from 'react';
import { Calculator, Scale, GraduationCap, School } from 'lucide-react';
import { calculateSekem } from '../utils/sekem';
import { cn } from '../lib/utils';

interface SekemDisplayProps {
    bagrutAverage: number;
    psychometricScore: number;
    className?: string;
}

export const SekemDisplay: React.FC<SekemDisplayProps> = ({ bagrutAverage, psychometricScore, className }) => {
    const sekem = useMemo(() => {
        return calculateSekem({ bagrutAverage, psychometricScore });
    }, [bagrutAverage, psychometricScore]);

    if (!bagrutAverage || !psychometricScore) {
        return (
            <div className={cn("bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4 text-center mb-4", className)}>
                <div className="flex items-center justify-center gap-2 text-indigo-400 mb-2">
                    <Calculator className="w-5 h-5" />
                </div>
                <p className="text-xs text-indigo-700 font-medium">
                    הזינו ציון פסיכומטרי כדי לחשב סכם קבלה
                </p>
            </div>
        );
    }

    return (
        <div className={cn("bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4", className)}>
            <div className="bg-slate-50/50 p-2 border-b border-slate-100 flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    סכם קבלה משוער
                </span>
            </div>

            <div className="p-4 grid grid-cols-3 gap-2 text-center divide-x divide-x-reverse divide-slate-100">
                {/* Technion */}
                <div className="flex flex-col items-center gap-1">
                    <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600 mb-1">
                        <GraduationCap size={16} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">טכניון</span>
                    <span className="text-lg font-black text-indigo-700 leading-none">
                        {sekem.technion}
                    </span>
                </div>

                {/* TAU */}
                <div className="flex flex-col items-center gap-1">
                    <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600 mb-1">
                        <School size={16} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">תל אביב</span>
                    <span className="text-lg font-black text-blue-700 leading-none">
                        {sekem.tau}
                    </span>
                </div>

                {/* BGU */}
                <div className="flex flex-col items-center gap-1">
                    <div className="bg-orange-50 p-1.5 rounded-lg text-orange-600 mb-1">
                        <School size={16} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">בן גוריון</span>
                    <span className="text-lg font-black text-orange-700 leading-none">
                        {sekem.bgu}
                    </span>
                </div>
            </div>

            <div className="bg-yellow-50/50 p-2 text-center border-t border-yellow-100/50">
                <p className="text-[10px] text-yellow-700/80">
                    * הערכה בלבד. החישוב הסופי נקבע ע"י המוסדות.
                </p>
            </div>
        </div>
    );
};
