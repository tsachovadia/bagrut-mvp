import React from 'react';

// Frankenstein UI Shim - Quick and Dirty

export const Card = ({ children, className = '' }: any) => (
    <div className={`bg-white rounded-xl shadow-md border p-4 ${className}`}>{children}</div>
);
export const CardHeader = ({ children, className = '' }: any) => (
    <div className={`mb-4 ${className}`}>{children}</div>
);
export const CardTitle = ({ children, className = '' }: any) => (
    <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
);
export const CardContent = ({ children, className = '' }: any) => (
    <div className={className}>{children}</div>
);

export const Button = ({ children, onClick, variant, className = '', ...props }: any) => {
    const base = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const styles = variant === 'outline'
        ? "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
        : variant === 'ghost'
            ? "hover:bg-gray-100 text-gray-700"
            : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";

    return (
        <button onClick={onClick} className={`${base} ${styles} ${className}`} {...props}>
            {children}
        </button>
    );
};

export const Input = ({ className = '', ...props }: any) => (
    <input className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
);

export const Label = ({ children, className = '', ...props }: any) => (
    <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>{children}</label>
);

export const Alert = ({ children, className = '' }: any) => (
    <div className={`p-4 rounded-md ${className}`}>{children}</div>
);
export const AlertDescription = ({ children, className = '' }: any) => (
    <div className={`text-sm ${className}`}>{children}</div>
);

export const Badge = ({ children, className = '' }: any) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

export const Progress = ({ value = 0, className = '' }: any) => (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
    </div>
);

export const Table = ({ children, ...props }: any) => <table className="min-w-full divide-y divide-gray-200" {...props}>{children}</table>;
export const TableHeader = ({ children, ...props }: any) => <thead className="bg-gray-50" {...props}>{children}</thead>;
export const TableBody = ({ children, ...props }: any) => <tbody className="bg-white divide-y divide-gray-200" {...props}>{children}</tbody>;
export const TableRow = ({ children, className = '', ...props }: any) => <tr className={className} {...props}>{children}</tr>;
export const TableHead = ({ children, className = '', ...props }: any) => (
    <th scope="col" className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`} {...props}>{children}</th>
);
export const TableCell = ({ children, className = '', ...props }: any) => (
    <td className={`px-6 py-4 whitespace-nowrap ${className}`} {...props}>{children}</td>
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
    <div className={`flex space-x-1 rounded-xl bg-gray-100 p-1 ${className}`}>
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
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${isActive
                ? 'bg-white text-blue-700 shadow'
                : 'text-gray-500 hover:bg-white/[0.12] hover:text-blue-600'
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
    return <div className={`mt-2 ${className}`}>{children}</div>;
};

export const Textarea = ({ className = '', ...props }: any) => (
    <textarea className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-right shadow-xl transition-all sm:w-full sm:max-w-lg z-[10000]">
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
            <div className={`bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 ${className}`} onClick={e => e.stopPropagation()}>
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
            className="absolute top-4 right-4 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => context?.setOpen(false)}
        >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    );
};

// Start: Fix - explicit displayName for detection
(DialogContent as any).displayName = 'DialogContent';

export const DialogHeader = ({ children, className = '' }: any) => (
    <div className={`mb-4 space-y-1.5 text-center sm:text-right ${className}`}>{children}</div>
);

export const DialogTitle = ({ children, className = '' }: any) => (
    <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);
