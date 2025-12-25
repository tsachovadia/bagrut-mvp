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

export const Table = ({ children }: any) => <table className="min-w-full divide-y divide-gray-200">{children}</table>;
export const TableHeader = ({ children }: any) => <thead className="bg-gray-50">{children}</thead>;
export const TableBody = ({ children }: any) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
export const TableRow = ({ children, className = '' }: any) => <tr className={className}>{children}</tr>;
export const TableHead = ({ children, className = '' }: any) => (
    <th scope="col" className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>{children}</th>
);
export const TableCell = ({ children, className = '' }: any) => (
    <td className={`px-6 py-4 whitespace-nowrap ${className}`}>{children}</td>
);

// Tabs Shim
export const Tabs = ({ defaultValue, children, className = '' }: any) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue);

    return (
        <div className={className}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { activeTab, setActiveTab } as any);
                }
                return child;
            })}
        </div>
    );
};

export const TabsList = ({ children, className = '', activeTab, setActiveTab }: any) => (
    <div className={`flex space-x-1 rounded-xl bg-gray-100 p-1 ${className}`}>
        {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { activeTab, setActiveTab } as any);
            }
            return child;
        })}
    </div>
);

export const TabsTrigger = ({ value, children, className = '', activeTab, setActiveTab }: any) => {
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

export const TabsContent = ({ value, children, className = '', activeTab }: any) => {
    if (value !== activeTab) return null;
    return <div className={`mt-2 ${className}`}>{children}</div>;
};
