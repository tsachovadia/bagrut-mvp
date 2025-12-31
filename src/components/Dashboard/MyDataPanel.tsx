import { useState } from 'react';
import { FileText, Calculator } from 'lucide-react';
import type { SubjectGrade, PsychometricScores } from '../../utils/calculator';
import { BagrutForm } from '../BagrutForm';
import { PsychometricForm } from '../PsychometricForm';

interface Props {
    stats: any;
    bagrut: SubjectGrade[];
    psychometric: PsychometricScores;
    onUpdate: (bagrut: SubjectGrade[], psychometric: PsychometricScores) => void;
}

export const MyDataPanel = ({ bagrut, psychometric, onUpdate }: Props) => {
    const [activeTab, setActiveTab] = useState<'bagrut' | 'psychometric'>('bagrut');

    const handleBagrutUpdate = (newGrades: SubjectGrade[]) => {
        onUpdate(newGrades, psychometric);
    };

    const handlePsychometricUpdate = (newScores: PsychometricScores) => {
        onUpdate(bagrut, newScores);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header / Tabs */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('bagrut')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
                        ${activeTab === 'bagrut' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <FileText className="w-4 h-4" />
                    בגרויות
                    {activeTab === 'bagrut' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                </button>
                <div className="w-[1px] bg-gray-100" />
                <button
                    onClick={() => setActiveTab('psychometric')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
                        ${activeTab === 'psychometric' ? 'text-purple-600 bg-purple-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Calculator className="w-4 h-4" />
                    פסיכומטרי
                    {activeTab === 'psychometric' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                    )}
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                <div className={activeTab === 'bagrut' ? 'block' : 'hidden'}>
                    <BagrutForm
                        initialData={bagrut}
                        onDataUpdate={handleBagrutUpdate}
                        variant="compact"
                        onAutoFill={() => {
                            // Optional: Implement autofill if needed, or remove prop
                        }}
                    />
                </div>

                <div className={activeTab === 'psychometric' ? 'block' : 'hidden'}>
                    <div className="p-2">
                        <PsychometricForm
                            initialData={psychometric}
                            onDataUpdate={handlePsychometricUpdate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
