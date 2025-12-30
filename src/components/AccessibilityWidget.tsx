import { useState, useEffect } from 'react';
import { Accessibility, Type, Eye, Sun, Link, RotateCcw, X } from 'lucide-react';
import { Button } from './ui/shim';

export function AccessibilityWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState({
        fontSize: 0, // 0 = normal, 1 = large, 2 = extra large
        grayscale: false,
        highContrast: false,
        highlightLinks: false
    });

    useEffect(() => {
        // Apply settings to document root
        const root = document.documentElement;

        // Font size
        if (settings.fontSize === 0) root.style.fontSize = '16px';
        if (settings.fontSize === 1) root.style.fontSize = '18px';
        if (settings.fontSize === 2) root.style.fontSize = '20px';

        // Grayscale
        if (settings.grayscale) root.classList.add('grayscale-mode');
        else root.classList.remove('grayscale-mode');

        // High Contrast
        if (settings.highContrast) root.classList.add('high-contrast-mode');
        else root.classList.remove('high-contrast-mode');

        // Highlight Links
        if (settings.highlightLinks) root.classList.add('highlight-links-mode');
        else root.classList.remove('highlight-links-mode');

    }, [settings]);

    const toggleOpen = () => setIsOpen(!isOpen);

    const resetSettings = () => {
        setSettings({
            fontSize: 0,
            grayscale: false,
            highContrast: false,
            highlightLinks: false
        });
    };

    return (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2" dir="rtl">
            {/* Menu */}
            {isOpen && (
                <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-4 w-64 mb-2 animate-in slide-in-from-bottom-2 zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Accessibility className="w-4 h-4 text-blue-600" />
                            נגישות
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Font Size */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 flex items-center gap-2">
                                <Type className="w-4 h-4 ml-1" /> גודל טקסט
                            </span>
                            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setSettings(s => ({ ...s, fontSize: 0 }))}
                                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${settings.fontSize === 0 ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-200'}`}
                                >
                                    א
                                </button>
                                <button
                                    onClick={() => setSettings(s => ({ ...s, fontSize: 1 }))}
                                    className={`w-8 h-8 flex items-center justify-center rounded-md text-base transition-colors ${settings.fontSize === 1 ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-200'}`}
                                >
                                    א
                                </button>
                                <button
                                    onClick={() => setSettings(s => ({ ...s, fontSize: 2 }))}
                                    className={`w-8 h-8 flex items-center justify-center rounded-md text-lg transition-colors ${settings.fontSize === 2 ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-200'}`}
                                >
                                    א
                                </button>
                            </div>
                        </div>

                        {/* Grayscale */}
                        <button
                            onClick={() => setSettings(s => ({ ...s, grayscale: !s.grayscale }))}
                            className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${settings.grayscale ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                            <span className="flex items-center gap-2 text-sm">
                                <Eye className="w-4 h-4 ml-1" /> גווני אפור
                            </span>
                            <div className={`w-4 h-4 rounded-full border ${settings.grayscale ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}></div>
                        </button>

                        {/* High Contrast */}
                        <button
                            onClick={() => setSettings(s => ({ ...s, highContrast: !s.highContrast }))}
                            className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${settings.highContrast ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                            <span className="flex items-center gap-2 text-sm">
                                <Sun className="w-4 h-4 ml-1" /> ניגודיות גבוהה
                            </span>
                            <div className={`w-4 h-4 rounded-full border ${settings.highContrast ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}></div>
                        </button>

                        {/* Highlight Links */}
                        <button
                            onClick={() => setSettings(s => ({ ...s, highlightLinks: !s.highlightLinks }))}
                            className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${settings.highlightLinks ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                            <span className="flex items-center gap-2 text-sm">
                                <Link className="w-4 h-4 ml-1" /> הדגשת קישורים
                            </span>
                            <div className={`w-4 h-4 rounded-full border ${settings.highlightLinks ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}></div>
                        </button>

                        {/* Reset */}
                        <button
                            onClick={resetSettings}
                            className="w-full flex items-center justify-center gap-2 p-2 mt-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" /> אפס הגדרות
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Trigger Button */}
            <button
                onClick={toggleOpen}
                className="w-12 h-12 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 overflow-hidden"
                aria-label="אפשרויות נגישות"
            >
                <img src="/accessibility_icon.png" alt="נגישות" className="w-full h-full object-cover" />
            </button>
        </div>
    );
}
