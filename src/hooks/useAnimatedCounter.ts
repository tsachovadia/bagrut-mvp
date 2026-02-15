import { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

export function useAnimatedCounter(target: number, duration: number = 2) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (!isInView || target === 0) return;

        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setDisplayValue(target);
            return;
        }

        const controls = animate(0, target, {
            duration,
            ease: 'easeOut',
            onUpdate: (latest) => setDisplayValue(Math.round(latest)),
        });

        return () => controls.stop();
    }, [isInView, target, duration]);

    return { ref, displayValue, isInView };
}
