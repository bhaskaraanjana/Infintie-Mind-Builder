import { useRef, useCallback } from 'react';

interface LongPressOptions {
    onLongPress: (e: React.MouseEvent | React.TouchEvent) => void;
    onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
    ms?: number;
    threshold?: number;
}

export const useLongPress = ({ onLongPress, onClick, ms = 500, threshold = 5 }: LongPressOptions) => {
    const timerRef = useRef<number | undefined>(undefined);
    const isLongPress = useRef(false);
    const startPos = useRef<{ x: number, y: number } | null>(null);

    const cancel = useCallback(() => {
        if (timerRef.current !== undefined) {
            clearTimeout(timerRef.current);
            timerRef.current = undefined;
        }
        startPos.current = null;
        isLongPress.current = false;
    }, []);

    const start = useCallback((e: React.MouseEvent | React.TouchEvent | any) => {
        isLongPress.current = false;

        // Handle both React synthetic events and native/Konva events
        const evt = e.evt || e;

        // Multi-touch detection: If more than 1 finger, it's likely a pinch or multi-finger gesture
        if (evt.touches && evt.touches.length > 1) {
            cancel();
            return;
        }

        const pos = (evt.touches && evt.touches.length > 0)
            ? { x: evt.touches[0].clientX, y: evt.touches[0].clientY }
            : { x: evt.clientX, y: evt.clientY };

        startPos.current = pos;

        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            onLongPress(e);
        }, ms) as unknown as number;
    }, [onLongPress, ms, cancel]);

    const move = useCallback((e: React.MouseEvent | React.TouchEvent | any) => {
        const evt = e.evt || e;

        if (evt.touches && evt.touches.length > 1) {
            cancel();
            return;
        }

        if (!startPos.current || timerRef.current === undefined) return;

        const pos = (evt.touches && evt.touches.length > 0)
            ? { x: evt.touches[0].clientX, y: evt.touches[0].clientY }
            : { x: evt.clientX, y: evt.clientY };

        const dx = Math.abs(pos.x - startPos.current.x);
        const dy = Math.abs(pos.y - startPos.current.y);

        if (dx > threshold || dy > threshold) {
            cancel();
        }
    }, [threshold, cancel]);

    const stop = useCallback((e: React.MouseEvent | React.TouchEvent | any) => {
        if (timerRef.current !== undefined) {
            clearTimeout(timerRef.current);
            timerRef.current = undefined;
        }

        if (!isLongPress.current && onClick && startPos.current) {
            onClick(e);
        }
        startPos.current = null;
    }, [onClick]);

    return {
        onMouseDown: start,
        onMouseMove: move,
        onMouseUp: stop,
        onMouseLeave: stop,
        onTouchStart: start,
        onTouchMove: move,
        onTouchEnd: stop,
        cancel
    };
};
