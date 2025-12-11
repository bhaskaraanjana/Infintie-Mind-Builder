import { useEffect, useRef } from 'react';

export const useModalHistory = (isOpen: boolean, onClose: () => void, modalName: string) => {
    const isPopping = useRef(false);

    // Initial Cleanup on Mount (if state implies open but we are closed)
    useEffect(() => {
        if (!isOpen && window.history.state?.modal === modalName) {
            window.history.back();
        }
    }, []);

    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            if (isOpen) {
                const currentState = e.state;
                // If we popped to a state that is NOT this modal, it means we should close.
                // (e.g. popped from 'settings' back to 'root' or 'editor')
                if (currentState?.modal !== modalName) {
                    isPopping.current = true;
                    onClose();
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isOpen, onClose, modalName]);

    useEffect(() => {
        if (isOpen) {
            // Push state only if we aren't already in it
            if (window.history.state?.modal !== modalName) {
                window.history.pushState({ modal: modalName }, '');
            }
        } else {
            // Closed via UI logic
            if (!isPopping.current) {
                // Only back() if we are currently in this modal's state
                // (Prevent backing if we already navigated away or if state is unrelated)
                if (window.history.state?.modal === modalName) {
                    window.history.back();
                }
            }
            // Reset flag
            isPopping.current = false;
        }
    }, [isOpen, modalName]);
};
