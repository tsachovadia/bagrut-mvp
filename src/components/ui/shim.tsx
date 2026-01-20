import React from 'react';

// Apple-Style UI Shim

export const Card = ({ children, className = '' }: any) => (
    <div className={`bg-white rounded-3xl shadow-apple border border-white/60 p-6 sm:p-8 backdrop-blur-sm ${className}`}>{children}</div>
);
export const CardHeader = ({ children, className = '' }: any) => (
    <div className={`mb-6 flex flex-col gap-1.5 ${className}`}>{children}</div>
);
export const CardTitle = ({ children, className = '' }: any) => (
    <h2 className={`text-2xl font-semibold tracking-tight text-apple-dark ${className}`}>{children}</h2>
);
export const CardDescription = ({ children, className = '' }: any) => (
    <p className={`text-base text-apple-subtext ${className}`}>{children}</p>
);
export const CardContent = ({ children, className = '' }: any) => (
    <div className={className}>{children}</div>
);

export const Button = ({ children, onClick, variant, className = '', ...props }: any) => {
    const base = "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    // Variants
    const variants = {
        primary: "bg-brand-purple-600 text-white hover:bg-brand-purple-700 shadow-lg shadow-brand-purple-500/20 active:scale-95",
        outline: "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 active:scale-95",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-95",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20",
    };

    const variantClass = variants[variant as keyof typeof variants] || variants.primary;

    return (
        <button onClick={onClick} className={`${base} ${variantClass} ${className}`} {...props}>
            {children}
        </button>
    );
};

export const Input = ({ className = '', ...props }: any) => (
    <input
        className={`w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple-600/20 focus:border-brand-purple-600 transition-all duration-200 ${className}`}
        {...props}
    />
);

export const Label = ({ children, className = '', ...props }: any) => (
    <label className={`block text-sm font-medium text-gray-700 mb-2 ml-1 ${className}`} {...props}>{children}</label>
);

export const Alert = ({ children, className = '' }: any) => (
    <div className={`p-4 rounded-2xl border border-gray-100 bg-gray-50 ${className}`}>{children}</div>
);
export const AlertDescription = ({ children, className = '' }: any) => (
    <div className={`text-sm text-gray-600 ${className}`}>{children}</div>
);

export const Badge = ({ children, className = '' }: any) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>{children}</span>
);

export const Progress = ({ value = 0, className = '' }: any) => (
    <div className={`w-full bg-gray-100 rounded-full h-2 ${className}`}>
        <div className="bg-brand-purple-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${value}%` }}></div>
    </div>
);

export const Table = ({ children, ...props }: any) => <div className="w-full overflow-auto"><table className="min-w-full divide-y divide-gray-100" {...props}>{children}</table></div>;
export const TableHeader = ({ children, ...props }: any) => <thead className="bg-gray-50/50" {...props}>{children}</thead>;
export const TableBody = ({ children, ...props }: any) => <tbody className="bg-white divide-y divide-gray-50" {...props}>{children}</tbody>;
export const TableRow = ({ children, className = '', ...props }: any) => <tr className={`hover:bg-gray-50/50 transition-colors ${className}`} {...props}>{children}</tr>;
export const TableHead = ({ children, className = '', ...props }: any) => (
    <th scope="col" className={`px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`} {...props}>{children}</th>
);
export const TableCell = ({ children, className = '', ...props }: any) => (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${className}`} {...props}>{children}</td>
);

// Tabs Shim using Context
const TabsContext = React.createContext<{ activeTab: string; setActiveTab: (v: string) => void } | null>(null);

export const Tabs = ({ defaultValue, children, className = '' }: any) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue);
    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};

export const TabsList = ({ children, className = '' }: any) => (
    <div className={`flex space-x-1 space-x-reverse rounded-full bg-gray-100/80 p-1.5 backdrop-blur-sm ${className}`}>
        {children}
    </div>
);

export const TabsTrigger = ({ value, children, className = '' }: any) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");
    const { activeTab, setActiveTab } = context;
    const isActive = activeTab === value;

    return (
        <button
            className={`w-full rounded-full py-2.5 text-sm font-medium leading-5 transition-all duration-300 ${isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                } ${className}`}
            onClick={() => setActiveTab(value)}
        >
            {children}
        </button>
    );
};

export const TabsContent = ({ value, children, className = '' }: any) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");
    const { activeTab } = context;

    if (value !== activeTab) return null;
    return <div className={`mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ${className}`}>{children}</div>;
};

export const Textarea = ({ className = '', ...props }: any) => (
    <textarea className={`w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple-600/20 focus:border-brand-purple-600 transition-all duration-200 ${className}`} {...props} />
);

// Dialog Shim using Context
const DialogContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export const Dialog = ({ open, onOpenChange, children }: any) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

    return (
        <DialogContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative transform overflow-hidden rounded-3xl bg-white text-right shadow-2xl transition-all sm:w-full sm:max-w-lg z-[10000] border border-white/20">
                        {/* Determine which child is the content and render it here */}
                        {React.Children.map(children, child => {
                            if (React.isValidElement(child) && (child.type as any).displayName === 'DialogContent') {
                                return React.cloneElement(child as any, { __isInPortal: true });
                            }
                            return null;
                        })}
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
};

export const DialogTrigger = ({ asChild, children, onClick, ...props }: any) => {
    const context = React.useContext(DialogContext);
    if (!context) throw new Error("DialogTrigger must be used within Dialog");
    const { setOpen } = context;

    const child = asChild ? React.Children.only(children) : <button {...props}>{children}</button>;
    return React.cloneElement(child, {
        onClick: (e: any) => {
            child.props.onClick?.(e);
            setOpen(true);
        }
    });
};

export const DialogContent = ({ children, className = '', __isInPortal }: any) => {
    if (__isInPortal) {
        return (
            <div className={`bg-white px-6 pb-6 pt-8 sm:p-8 sm:pb-8 ${className}`} onClick={e => e.stopPropagation()}>
                <CloseButton />
                {children}
            </div>
        );
    }
    return null;
};

// Helper for closing
const CloseButton = () => {
    const context = React.useContext(DialogContext);
    return (
        <button
            type="button"
            className="absolute top-4 left-4 rounded-full p-1 bg-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-200 focus:outline-none transition-colors"
            onClick={() => context?.setOpen(false)}
        >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    );
};

// Start: Fix - explicit displayName for detection
(DialogContent as any).displayName = 'DialogContent';

export const DialogHeader = ({ children, className = '' }: any) => (
    <div className={`mb-6 space-y-2 text-center sm:text-right ${className}`}>{children}</div>
);

export const DialogTitle = ({ children, className = '' }: any) => (
    <h3 className={`text-xl font-semibold leading-none tracking-tight text-gray-900 ${className}`}>{children}</h3>
);
