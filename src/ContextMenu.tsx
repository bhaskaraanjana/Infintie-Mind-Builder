import React, { useState } from 'react';

export interface MenuOption {
    label: string;
    action?: () => void;
    danger?: boolean;
    submenu?: MenuOption[];
}

interface Props {
    x: number;
    y: number;
    options: MenuOption[];
    onClose: () => void;
}

interface MenuLevel {
    title: string;
    options: MenuOption[];
}

const MenuItem: React.FC<{
    option: MenuOption;
    onClose: () => void;
    onNavigate: (title: string, submenu: MenuOption[]) => void;
}> = ({ option, onClose, onNavigate }) => {

    return (
        <div
            style={{
                padding: '12px 16px', // Larger touch target
                cursor: 'pointer',
                color: option.danger ? '#ef4444' : 'var(--theme-text-primary, #333)',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--theme-border-color, #eee)',
                backgroundColor: 'transparent',
                transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-hover-bg, #f5f5f5)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            onClick={(e) => {
                e.stopPropagation();
                if (option.submenu) {
                    onNavigate(option.label, option.submenu);
                } else if (option.action) {
                    option.action();
                    onClose();
                }
            }}
        >
            <span style={{ fontWeight: 500 }}>{option.label}</span>
            {option.submenu && <span style={{ color: '#999', fontSize: '18px' }}>›</span>}
        </div>
    );
};

export const ContextMenu: React.FC<Props> = ({ x, y, options, onClose }) => {
    // Stack for drill-down navigation
    const [history, setHistory] = useState<MenuLevel[]>([{ title: 'Menu', options }]);

    const currentLevel = history[history.length - 1];

    const handleNavigate = (title: string, submenu: MenuOption[]) => {
        setHistory([...history, { title, options: submenu }]);
    };

    const handleBack = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (history.length > 1) {
            setHistory(history.slice(0, -1));
        }
    };

    return (
        <>
            {/* Backdrop to close menu on click outside */}
            <div
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                onClick={onClose}
                onContextMenu={(e) => { e.preventDefault(); onClose(); }}
            />

            <div style={{
                position: 'fixed',
                top: y,
                left: x,
                backgroundColor: 'var(--theme-bg, #fff)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                padding: '0',
                zIndex: 1000,
                minWidth: '220px',
                maxWidth: '280px', // Prevent too wide on mobile
                border: '1px solid var(--theme-border-color, #e5e7eb)',
                overflow: 'hidden',
                animation: 'fadeIn 0.1s ease-out'
            }}>
                {/* Header (Only if deep or title is relevant, but mostly for Back button) */}
                {history.length > 1 && (
                    <div
                        onClick={handleBack}
                        style={{
                            padding: '10px 16px',
                            borderBottom: '1px solid var(--theme-border-color, #eee)',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: 'var(--theme-hover-bg, #f9fafb)',
                            color: 'var(--theme-text-secondary, #666)',
                            fontSize: '13px',
                            fontWeight: 600
                        }}
                    >
                        <span style={{ marginRight: '6px', fontSize: '16px' }}>‹</span> Back
                    </div>
                )}

                {/* Menu List */}
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {currentLevel.options.map((option, index) => (
                        <MenuItem
                            key={index}
                            option={option}
                            onClose={onClose}
                            onNavigate={handleNavigate}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};
