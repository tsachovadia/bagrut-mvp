import { useState } from 'react';
import { Layers, X } from 'lucide-react';
import { TrackedDegreesWidget } from './TrackedDegreesWidget';
import { useTrackedDegrees } from '../context/TrackedDegreesContext';
import { cn } from '../lib/utils';
import { admissionEngine } from '../services/admission-engine';
import { useEffect } from 'react';

export function TrackedDegreesFloatingMenu() {
    const { trackedIds } = useTrackedDegrees();
    const [isOpen, setIsOpen] = useState(false);
    const [programs, setPrograms] = useState<any[]>([]);

    const toggleOpen = () => setIsOpen(!isOpen);

    // Pre-fetch programs if not already loaded elsewhere, or rely on internal fetching of widget.
    // Actually, TrackedDegreesWidget can handle fetching if we don't pass availablePrograms.
    // But for smoother UX, let's try to fetch if we open it.

    // We can just pass `undefined` for availablePrograms and let the widget handle it,
    // or reusing the widget's internal logic. 
    // The widget currently has:
    // useEffect(() => { if (!availablePrograms && trackedIds.length > 0) fetch... }, ...)

    // So we can just render the widget. 
    // However, the widget has a header with "Expand/Collapse".
    // We might want to hide that header or force it expanded since the Popover IS the container.
    // Or we can just let it be. The user can collapse it inside the popover? 
    // Actually, standard behavior for such menus is just "Open menu -> see list".
    // The widget's internal "isExpanded" state defaults to true.
    // But the widget renders a container with border/shadow.

    // Let's wrap it nicely.

    if (trackedIds.length === 0) {
        // Option: Don't show the floating button if empty? 
        // Or show it so they can see "No degrees tracked + Call to action".
        // Accessibility widget is always shown. Let's always show it.
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2" dir="rtl">
            {/* Menu Popover */}
            {isOpen && (
                <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl w-80 mb-4 animate-in slide-in-from-bottom-2 zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[60vh]">
                    {/* Custom Header for the Popover */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white/50 backdrop-blur-md">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-600" />
                            התארים שלי
                            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                                {trackedIds.length}
                            </span>
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content - We reuse the Widget but might need to styling overrides if possible.
                        The Widget currently renders its own outer container style. 
                        We can pass `className="border-0 shadow-none"` to make it blend in.
                    */}
                    <div className="p-0 overflow-hidden flex-1 flex flex-col">
                        <TrackedDegreesWidget
                            className="border-0 shadow-none rounded-none w-full !bg-transparent"
                        // We don't have userStats here easily unless we fetch or pass globally.
                        // The widget can work without userStats (just won't show checkmarks).
                        // Ideally App should provide userStats in context or we pass it down.
                        // For now, let's leave userStats undefined. The checkmarks are nice but not critical for v1 of this menu.
                        // OR we can grab them if we move userStats to Context.
                        />
                    </div>
                </div>
            )}

            {/* Floating Trigger Button */}
            <button
                onClick={toggleOpen}
                className={cn(
                    "w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center relative group",
                    isOpen ? "bg-gray-800 text-white rotate-90" : "bg-white text-indigo-600 hover:scale-105 active:scale-95 hover:shadow-indigo-200/50"
                )}
                aria-label="התארים שלי"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <Layers className="w-6 h-6 transition-transform group-hover:scale-110" />
                        {trackedIds.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                {trackedIds.length}
                            </span>
                        )}
                    </>
                )}
            </button>
        </div>
    );
}
