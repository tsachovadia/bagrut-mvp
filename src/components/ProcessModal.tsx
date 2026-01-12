import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { SmartLoadingPopup } from './SmartLoadingPopup';
import { Button } from './ui/shim';

interface ProcessModalProps {
    isOpen: boolean;
    phase: 'scanning' | 'processing' | 'complete';
    rawText?: string;
    extractedJson?: any;
    error?: string | null;
    onClose: () => void;
}

export const ProcessModal = ({ isOpen, phase, error, onClose }: ProcessModalProps) => {
    if (!isOpen) return null;

    return typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header with Close */}
                <div className="p-4 flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-500">
                        {error ? <span className="text-red-600 flex items-center gap-2">⚠️ שגיאה בתהליך</span> : "מעבד נתונים..."}
                    </div>
                    <Button variant="ghost" onClick={onClose} className="rounded-full w-8 h-8 p-0 hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-400" />
                    </Button>
                </div>

                {/* Main Progress Visuals or Error */}
                <div className="px-8 pb-8 flex flex-col items-center">
                    {error ? (
                        <div className="text-center space-y-3 animate-in zoom-in-95">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <X className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-red-700">אירעה שגיאה</h3>
                            <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm">{error}</p>
                            <p className="text-xs text-gray-500 pt-2">אנא נסה שנית עם תמונה ברורה יותר.</p>
                        </div>
                    ) : (
                        <SmartLoadingPopup phase={phase} />
                    )}
                </div>
            </div>
        </div>,
        document.body
    ) : null;
};
