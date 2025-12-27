import React, { useState } from 'react';
import { ArrowRightCircle, BookOpen, ChevronDown, ChevronRight, Zap } from 'lucide-react';

interface FleetingActionsProps {
    onConvertToPermanent: () => void;
    onConvertToLiterature: () => void;
    // Controlled State Props
    isOpen?: boolean;
    onToggle?: () => void;
    readOnly?: boolean;
    hideHeader?: boolean;
}

export const FleetingActions: React.FC<FleetingActionsProps> = ({
    onConvertToPermanent,
    onConvertToLiterature,
    isOpen: controlledIsOpen,
    onToggle: controlledOnToggle,
    readOnly,
    hideHeader
}) => {
    const [localIsOpen, setLocalIsOpen] = useState(false);
    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : localIsOpen;

    const handleToggle = () => {
        if (controlledOnToggle) {
            controlledOnToggle();
        } else {
            setLocalIsOpen(!localIsOpen);
        }
    };

    return (
        <div className={`flex flex-col gap-3 ${!hideHeader ? 'p-3 bg-neutral-50 rounded-md border border-neutral-200 shadow-sm' : ''} transition-all duration-200 h-full`}>
            {!hideHeader && (
                <button
                    onClick={handleToggle}
                    className="flex items-center gap-2 text-neutral-700 font-bold text-sm hover:text-primary-700 transition-colors py-1 w-full text-left"
                >
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <Zap size={18} />
                    <span>Actions</span>
                </button>
            )}

            {isOpen && !readOnly && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <button
                        onClick={onConvertToLiterature}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left border"
                        style={{
                            backgroundColor: 'var(--neutral-50)',
                            borderColor: 'var(--neutral-200)',
                            color: 'var(--text)'
                        }}
                        title="Convert to Literature Note (Add Sources)"
                    >
                        <BookOpen size={16} style={{ color: 'var(--neutral-500)' }} />
                        <span className="flex-grow">To Literature</span>
                    </button>

                    <button
                        onClick={onConvertToPermanent}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors shadow-sm text-left border border-transparent"
                        style={{
                            backgroundColor: 'var(--primary-600)',
                            color: 'white'
                        }}
                        title="Convert to Permanent Note (Solidify Idea)"
                    >
                        <ArrowRightCircle size={16} />
                        <span className="flex-grow">To Permanent</span>
                    </button>

                    <div className="mt-1 text-xs text-neutral-400 px-1">
                        Select a type to process this fleeting note.
                    </div>
                </div>
            )}
        </div>
    );
};
