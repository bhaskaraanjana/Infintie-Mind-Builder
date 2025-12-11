import { MousePointer2, BoxSelect } from 'lucide-react';
import { useStore } from '../store';

export const SelectionToggle = () => {
    const selectionMode = useStore((state) => state.selectionMode);
    const toggleSelectionMode = useStore((state) => state.toggleSelectionMode);

    // Only show on touch devices or small screens? 
    // For now, always showing it is safer for testing responsiveness

    return (
        <button
            onClick={toggleSelectionMode}
            className={`selection-toggle ${selectionMode ? 'active' : ''}`}
            title={selectionMode ? "Exit Multi-select Mode" : "Enter Multi-select Mode"}
            style={{
                position: 'fixed',
                top: '20px', // Aligned with Settings
                right: '80px', // Left of Settings (20px margin + 48px width + 12px gap)
                width: '48px', // Standardize size
                height: '48px',
                borderRadius: 'var(--radius-full)', // Match others
                backgroundColor: selectionMode ? 'var(--theme-primary)' : 'var(--glass-bg)',
                color: selectionMode ? 'white' : 'var(--theme-text)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 30, // UI layer
                backdropFilter: 'blur(12px)',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
        >
            {selectionMode ? <BoxSelect size={20} /> : <MousePointer2 size={20} />}
        </button>
    );
};
