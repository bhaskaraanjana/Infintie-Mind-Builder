import React, { useState } from 'react';
import type { Note } from '../../types';
import { useStore } from '../../store';
import { ArrowLeftCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface BacklinksPanelProps {
    noteId: string;
    onNavigate: (id: string) => void;
}

export const BacklinksPanel: React.FC<BacklinksPanelProps> = ({ noteId, onNavigate }) => {
    const notes = useStore((state) => state.notes);
    const [isOpen, setIsOpen] = useState(true);

    // Get notes that link TO this note
    const backlinks = Object.values(notes).filter(n => n.references && n.references.includes(noteId));

    if (backlinks.length === 0) return null;

    return (
        <div className="mt-8 border-t border-neutral-200 pt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2 hover:text-primary-600 transition-colors w-full"
            >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <ArrowLeftCircle size={14} />
                <span>Backlinks ({backlinks.length})</span>
            </button>

            {isOpen && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {backlinks.map(link => (
                        <button
                            key={link.id}
                            onClick={() => onNavigate(link.id)}
                            className="group flex flex-col p-3 rounded-md bg-neutral-50 hover:bg-neutral-100 border border-transparent hover:border-neutral-200 transition-all text-left active:scale-[0.99]"
                        >
                            <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-600 transition-colors">
                                {link.title || "Untitled"}
                            </span>
                            <span className="text-xs text-neutral-400 mt-1 line-clamp-1">
                                {link.content.replace(/<[^>]*>?/gm, '').substring(0, 80)}...
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
