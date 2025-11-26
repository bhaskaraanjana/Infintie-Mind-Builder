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

const MenuItem: React.FC<{ option: MenuOption; onClose: () => void }> = ({ option, onClose }) => {
    const [showSubmenu, setShowSubmenu] = useState(false);

    return (
        <div
            style={{
                position: 'relative',
                padding: '10px 20px',
                cursor: 'pointer',
                color: option.danger ? '#ff4444' : '#333',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: showSubmenu ? '#f5f5f5' : 'transparent'
            }}
            onClick={(e) => {
                if (option.submenu) {
                    e.stopPropagation();
                } else if (option.action) {
                    option.action();
                    onClose();
                }
            }}
            onMouseEnter={() => setShowSubmenu(true)}
            onMouseLeave={() => setShowSubmenu(false)}
        >
            {option.label}
            {option.submenu && <span>›</span>}

            {/* Submenu */}
            {showSubmenu && option.submenu && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '100%',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: '8px 0',
                    zIndex: 1001,
                    minWidth: '180px',
                    border: '1px solid #eee'
                }}>
                    {option.submenu.map((subOption, index) => (
                        <MenuItem key={index} option={subOption} onClose={onClose} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const ContextMenu: React.FC<Props> = ({ x, y, options, onClose }) => {
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
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '8px 0',
                zIndex: 1000,
                minWidth: '180px',
                border: '1px solid #eee'
            }}>
                {options.map((option, index) => (
                    <MenuItem key={index} option={option} onClose={onClose} />
                ))}
            </div>
        </>
    );
};
