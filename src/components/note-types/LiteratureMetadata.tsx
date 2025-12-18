import React, { useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import type { Note, SourceMetadata } from '../../types';
import { SourceForm } from './SourceForm';

interface LiteratureMetadataProps {
    metadata: Note['metadata']; // Legacy support (optional)
    sources: SourceMetadata[];
    onChange: (sources: SourceMetadata[]) => void;
    readOnly?: boolean;
    // Controlled State Props
    isOpen?: boolean;
    onToggle?: () => void;
    hideHeader?: boolean;
}

export const LiteratureMetadata: React.FC<LiteratureMetadataProps> = ({
    sources = [],
    onChange,
    readOnly,
    isOpen: controlledIsOpen,
    onToggle: controlledOnToggle,
    hideHeader
}) => {
    const [localIsOpen, setLocalIsOpen] = useState(false);
    const isEditingMode = controlledIsOpen !== undefined;
    const isOpen = isEditingMode ? controlledIsOpen : localIsOpen;
    const handleToggle = () => {
        if (controlledOnToggle) {
            controlledOnToggle();
        } else {
            setLocalIsOpen(!localIsOpen);
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editingSource, setEditingSource] = useState<SourceMetadata | undefined>(undefined);

    const handleSaveSource = (source: SourceMetadata) => {
        if (editingSource) {
            // Update existing
            const updated = sources.map(s => s.id === source.id ? source : s);
            onChange(updated);
        } else {
            // Add new
            onChange([...sources, source]);
        }
        setIsEditing(false);
        setEditingSource(undefined);
    };

    const handleDeleteSource = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Remove this source?')) {
            onChange(sources.filter(s => s.id !== id));
        }
    };

    const handleEditSource = (source: SourceMetadata, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSource(source);
        setIsEditing(true);
    };

    const handleAddSource = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSource(undefined);
        setIsEditing(true);
    };

    return (
        <div className={`flex flex-col gap-3 ${!hideHeader ? 'p-3 bg-neutral-50 rounded-md border border-neutral-200 shadow-sm' : ''} transition-all duration-200 h-full`}>
            {/* Header */}
            {!hideHeader && (
                <div className="flex items-center justify-between w-full">
                    <button
                        onClick={handleToggle}
                        className="flex items-center gap-2 text-neutral-700 font-bold text-sm hover:text-primary-700 transition-colors py-1 flex-grow text-left"
                    >
                        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        <BookOpen size={18} />
                        <span>Sources ({sources.length})</span>
                    </button>

                    {isOpen && !isEditing && !readOnly && (
                        <button
                            onClick={handleAddSource}
                            className="flex items-center gap-1 px-2 py-1 bg-primary-100 hover:bg-primary-200 text-primary-700 text-xs font-semibold rounded transition-colors"
                        >
                            <Plus size={14} />
                            Add Source
                        </button>
                    )}
                </div>
            )}

            {/* Toolbar for Tabs Mode (Add Source Button) */}
            {hideHeader && !isEditing && !readOnly && isOpen && (
                <div className="flex justify-end mb-2">
                    <button
                        onClick={handleAddSource}
                        className="flex items-center gap-1 px-2 py-1 bg-primary-100 hover:bg-primary-200 text-primary-700 text-xs font-semibold rounded transition-colors"
                    >
                        <Plus size={14} />
                        Add Source
                    </button>
                </div>
            )}

            {/* Content */}
            {isOpen && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    {isEditing ? (
                        <SourceForm
                            source={editingSource}
                            onSave={handleSaveSource}
                            onCancel={() => {
                                setIsEditing(false);
                                setEditingSource(undefined);
                            }}
                        />
                    ) : (
                        <div className="flex flex-col gap-2">
                            {sources.length === 0 ? (
                                <div className="text-center py-4 border-2 border-dashed border-neutral-200 rounded-md">
                                    <p className="text-sm text-neutral-500 mb-2">No sources linked yet.</p>
                                    {!readOnly && (
                                        <button
                                            onClick={handleAddSource}
                                            className="text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline"
                                        >
                                            Add your first source
                                        </button>
                                    )}
                                </div>
                            ) : sources.map(source => (
                                <div
                                    key={source.id}
                                    className="flex items-center justify-between gap-3 p-2 bg-white border border-neutral-200 rounded-md hover:border-primary-300 hover:shadow-sm transition-all"
                                >
                                    <div className="flex-grow min-w-0 flex items-center gap-2 text-sm text-neutral-700">
                                        <span className="font-semibold text-neutral-900 truncate">{source.title}</span>
                                        {source.author && (
                                            <>
                                                <span className="text-neutral-300">/</span>
                                                <span className="truncate">{source.author}</span>
                                            </>
                                        )}
                                        {source.publishedDate && (
                                            <>
                                                <span className="text-neutral-300">/</span>
                                                <span className="text-neutral-500 whitespace-nowrap">{source.publishedDate}</span>
                                            </>
                                        )}
                                        {source.url && (
                                            <>
                                                <span className="text-neutral-300">/</span>
                                                <a
                                                    href={source.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-primary-600 hover:underline whitespace-nowrap"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <ExternalLink size={12} /> Link
                                                </a>
                                            </>
                                        )}
                                    </div>

                                    {!readOnly && (
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={(e) => handleEditSource(source, e)}
                                                className="p-1 text-neutral-400 hover:text-primary-600 rounded hover:bg-neutral-100 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteSource(source.id, e)}
                                                className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                                                title="Remove"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
