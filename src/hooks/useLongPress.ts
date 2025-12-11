import { useRef, useCallback } from 'react';

interface LongPressOptions {
    onLongPress: (e: React.MouseEvent | React.TouchEvent) => void;
    onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
    ms?: number;
}

export const useLongPress = ({ onLongPress, onClick, ms = 500 }: LongPressOptions) => {
    const timerRef = useRef<NodeJS.Timeout>();
    const isLongPress = useRef(false);

    const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            onLongPress(e);
        }, ms);
    }, [onLongPress, ms]);

    const stop = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (!isLongPress.current && onClick) {
            onClick(e);
        }
    }, [onClick]);

    return {
        onMouseDown: (e: React.MouseEvent) => start(e),
        onMouseUp: (e: React.MouseEvent) => stop(e),
        onMouseLeave: (e: React.MouseEvent) => stop(e),
        onTouchStart: (e: React.TouchEvent) => start(e),
        onTouchEnd: (e: React.TouchEvent) => stop(e),
    };
};
