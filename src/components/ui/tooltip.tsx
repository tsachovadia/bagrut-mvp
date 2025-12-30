
import React, { useState, createContext, useContext } from 'react';

const TooltipContext = createContext<{
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    openTimeout: React.MutableRefObject<NodeJS.Timeout | null>;
    closeTimeout: React.MutableRefObject<NodeJS.Timeout | null>;
    delayDuration: number;
} | null>(null);

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

export const Tooltip = ({
    children,
    delayDuration = 200
}: {
    children: React.ReactNode;
    delayDuration?: number;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const openTimeout = React.useRef<NodeJS.Timeout | null>(null);
    const closeTimeout = React.useRef<NodeJS.Timeout | null>(null);

    return (
        <TooltipContext.Provider value={{ isOpen, setIsOpen, openTimeout, closeTimeout, delayDuration }}>
            <div className="relative inline-flex">
                {children}
            </div>
        </TooltipContext.Provider>
    );
};

export const TooltipTrigger = ({
    children,
    asChild
}: {
    children: React.ReactNode;
    asChild?: boolean;
}) => {
    const context = useContext(TooltipContext);
    if (!context) throw new Error("TooltipTrigger must be used within a Tooltip");

    const { setIsOpen, openTimeout, closeTimeout, delayDuration } = context;

    const handleMouseEnter = () => {
        if (closeTimeout.current) clearTimeout(closeTimeout.current);
        openTimeout.current = setTimeout(() => setIsOpen(true), delayDuration);
    };

    const handleMouseLeave = () => {
        if (openTimeout.current) clearTimeout(openTimeout.current);
        closeTimeout.current = setTimeout(() => setIsOpen(false), 100);
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onFocus: handleMouseEnter,
            onBlur: handleMouseLeave,
        });
    }

    return (
        <button
            type="button"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
        >
            {children}
        </button>
    );
};

export const TooltipContent = ({
    children,
    className = "",
    side = "top"
}: {
    children: React.ReactNode;
    className?: string;
    side?: "top" | "bottom" | "left" | "right";
}) => {
    const context = useContext(TooltipContext);
    if (!context) throw new Error("TooltipContent must be used within a Tooltip");

    if (!context.isOpen) return null;

    // Simple positioning logic
    const positionClasses = {
        top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
        bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
        left: "right-full mr-2 top-1/2 -translate-y-1/2",
        right: "left-full ml-2 top-1/2 -translate-y-1/2",
    };

    return (
        <div className={`absolute z-50 overflow-hidden rounded-md border bg-white px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${positionClasses[side]} ${className}`}>
            {children}
        </div>
    );
};
