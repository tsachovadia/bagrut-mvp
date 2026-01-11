import { useState } from 'react';
import { X, ChevronDown, ChevronRight, FileText, Code } from 'lucide-react';
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

export const ProcessModal = ({ isOpen, phase, rawText, extractedJson, error, onClose }: ProcessModalProps) => {
    const [isDebugOpen, setIsDebugOpen] = useState(true); // Default open for development as requested
    const [activeTab, setActiveTab] = useState<'raw' | 'json'>('raw');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">

                {/* Header with Close */}
                <div className="p-4 flex justify-between items-center">
                    {/* Title or Empty space */}
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
                            <p className="text-xs text-gray-500 pt-2">ניתן לצפות בנתונים הטכניים למטה לאבחון הבעיה.</p>
                        </div>
                    ) : (
                        <SmartLoadingPopup phase={phase} />
                    )}
                </div>

                {/* Debug / Details Section */}
                <div className="border-t border-gray-100 bg-gray-50/50 flex flex-col flex-1 min-h-0">
                    <button
                        onClick={() => setIsDebugOpen(!isDebugOpen)}
                        className="flex items-center gap-2 p-4 text-xs font-semibold text-gray-500 hover:text-gray-800 w-full text-right"
                    >
                        {isDebugOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        נתונים טכניים (Debug View)
                    </button>

                    {isDebugOpen && (
                        <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-top-2">
                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 px-4">
                                <button
                                    onClick={() => setActiveTab('raw')}
                                    className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'raw'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <FileText className="w-3 h-3" />
                                    Phase 1: Raw Text
                                </button>
                                <button
                                    onClick={() => setActiveTab('json')}
                                    className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'json'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Code className="w-3 h-3" />
                                    Phase 2: JSON
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-auto p-4 bg-gray-100 font-mono text-[10px] leading-relaxed text-gray-700 dir-ltr text-left">
                                {activeTab === 'raw' ? (
                                    rawText ? (
                                        <pre className="whitespace-pre-wrap break-all">{rawText}</pre>
                                    ) : (
                                        <div className="text-gray-400 italic p-4 text-center">Waiting for Phase 1 output...</div>
                                    )
                                ) : (
                                    extractedJson ? (
                                        <pre className="whitespace-pre-wrap">{JSON.stringify(extractedJson, null, 2)}</pre>
                                    ) : (
                                        <div className="text-gray-400 italic p-4 text-center">Waiting for Phase 2 output...</div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
