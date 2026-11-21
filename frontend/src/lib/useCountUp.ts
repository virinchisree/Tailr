import { useEffect, useState } from 'react';

/** Counts from 0 up to `target` with an ease-out curve. Jumps straight there if motion is reduced. */
export function useCountUp(target: number, duration = 900): number {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const start = performance.now();
        let frame = 0;
        const tick = (now: number) => {
            const p = reduce ? 1 : Math.min(1, (now - start) / duration);
            setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return value;
}