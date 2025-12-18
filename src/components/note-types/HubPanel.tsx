import React, { useState } from 'react';
import type { Note, Cluster } from '../../types';
import { useStore } from '../../store';
import { Network, ArrowLeftCircle, CircleDot, ChevronDown, ChevronRight } from 'lucide-react';

interface HubPanelProps {
    noteId: string;
    clusterId?: string;
    onNavigate: (id: string) => void;
}

export const HubPanel: React.FC<HubPanelProps> = ({ noteId, clusterId, onNavigate }) => {
    const notes = useStore((state) => state.notes);
    const clusters = useStore((state) => state.clusters);
    const [isOpen, setIsOpen] = useState(true);

    // 1. Get Cluster Children
    const cluster = clusterId ? clusters[clusterId] : null;
    const children = cluster ? cluster.children.map(id => notes[id]).filter(Boolean) : [];

    // 2. Get Backlinks (Notes that reference THIS note)
    const backlinks = Object.values(notes).filter(n => n.references && n.references.includes(noteId));

    if (children.length === 0 && backlinks.length === 0) return null;

    const totalConnections = children.length + backlinks.length;

    return (
        <div className="flex flex-col gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 mt-6 shadow-sm transition-all duration-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-sm font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-2 w-full hover:text-primary-700 transition-colors"
            >
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                <Network size={18} />
                <span>Connections ({totalConnections})</span>
            </button>

            {isOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    {children.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-neutral-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                                <CircleDot size={12} /> Cluster Contents ({children.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {children.map(child => (
                                    <button
                                        key={child.id}
                                        onClick={() => onNavigate(child.id)}
                                        className="flex flex-col items-start p-3 bg-white rounded-md border border-neutral-200 hover:border-primary-400 hover:shadow-md transition-all text-left active:scale-[0.98] duration-150"
                                    >
                                        <span className="text-sm font-medium text-neutral-800 truncate w-full">{child.title || "Untitled"}</span>
                                        <span className="text-xs text-neutral-400 truncate w-full mt-1">{child.content.substring(0, 50)}...</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {backlinks.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-neutral-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                                <ArrowLeftCircle size={12} /> Mentioned In ({backlinks.length})
                            </h4>
                            <div className="flex flex-col gap-1">
                                {backlinks.map(link => (
                                    <button
                                        key={link.id}
                                        onClick={() => onNavigate(link.id)}
                                        className="flex items-center gap-2 p-3 rounded-md hover:bg-neutral-100 border border-transparent hover:border-neutral-200 transition-all text-left text-sm text-neutral-700 active:bg-neutral-200"
                                    >
                                        <ArrowLeftCircle size={16} className="text-neutral-400 flex-shrink-0" />
                                        <span className="truncate">{link.title || "Untitled"}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
