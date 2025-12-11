export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' = 'light') => {
    if (!navigator.vibrate) return;

    switch (type) {
        case 'light':
            navigator.vibrate(10); // Very short tick
            break;
        case 'medium':
            navigator.vibrate(20);
            break;
        case 'heavy':
            navigator.vibrate(40);
            break;
        case 'selection': // Like standard iOS selection click
            navigator.vibrate(15);
            break;
        case 'success':
            navigator.vibrate([10, 30, 10]); // double tap
            break;
        case 'warning':
            navigator.vibrate([30, 20, 30]);
            break;
        case 'error':
            navigator.vibrate([50, 50, 50]);
            break;
        default:
            navigator.vibrate(10);
    }
};
