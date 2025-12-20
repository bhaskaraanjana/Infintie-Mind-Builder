import React, { useState, useMemo } from 'react';
import { Tag, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';

interface TagsPanelProps {
    tags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    readOnly?: boolean;
    // Controlled State Props
    isOpen?: boolean;
    onToggle?: () => void;
    hideHeader?: boolean;
}

export const TagsPanel: React.FC<TagsPanelProps> = ({
    tags,
    onAddTag,
    onRemoveTag,
    readOnly,
    isOpen: controlledIsOpen,
    onToggle: controlledOnToggle,
    hideHeader
}) => {
    const notes = useStore(state => state.notes);

    // Compute available tags for autocomplete from store
    const availableTags = useMemo(() => {
        const uniqueTags = new Set<string>();
        Object.values(notes).forEach(note => {
            if (note.tags) {
                note.tags.forEach(tag => uniqueTags.add(tag));
            }
        });
        return Array.from(uniqueTags).sort();
    }, [notes]);

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
    const [input, setInput] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            onAddTag(input.trim());
            setInput('');
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
                    <Tag size={18} />
                    <span>Tags ({tags.length})</span>
                </button>
            )}

            {isOpen && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200 pt-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map(tag => (
                            <span key={tag} className="flex items-center bg-white border border-neutral-300 rounded-full px-3 py-1 text-sm text-neutral-700 shadow-sm">
                                {tag}
                                {!readOnly && (
                                    <button
                                        onClick={() => onRemoveTag(tag)}
                                        className="ml-2 text-neutral-400 hover:text-red-500 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </span>
                        ))}
                        {tags.length === 0 && (
                            <span className="text-xs text-neutral-400 italic py-1">No tags added yet.</span>
                        )}
                    </div>

                    {!readOnly && (
                        <div className="relative">
                            <div className="flex items-center bg-white border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                                <Plus size={16} className="text-neutral-400 mr-2" />
                                <input
                                    type="text"
                                    className="w-full bg-transparent outline-none text-sm min-h-[22px]"
                                    placeholder="add-tag..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>

                            {/* Autocomplete Suggestions */}
                            {input.trim() && availableTags.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                                    {availableTags
                                        .filter(t => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t))
                                        .map(suggestion => (
                                            <button
                                                key={suggestion}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center gap-2"
                                                onClick={() => {
                                                    onAddTag(suggestion);
                                                    setInput('');
                                                }}
                                            >
                                                <Tag size={12} className="text-neutral-400" />
                                                <span>{suggestion}</span>
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
