import React, { useState, useEffect } from 'react';
import { BookOpen, Link as LinkIcon, Calendar, User, ChevronRight, ChevronDown } from 'lucide-react';
import type { Note } from '../../types';

interface LiteratureMetadataProps {
    metadata: Note['metadata'];
    onChange: (metadata: Note['metadata']) => void;
    readOnly?: boolean;
}

export const LiteratureMetadata: React.FC<LiteratureMetadataProps> = ({ metadata, onChange, readOnly }) => {
    const [author, setAuthor] = useState(metadata?.author || '');
    const [url, setUrl] = useState(metadata?.url || '');
    const [date, setDate] = useState(metadata?.publishedDate || '');
    const [isOpen, setIsOpen] = useState(true); // Default open to encourage data entry

    // Sync local state when prop changes (e.g. switching notes)
    useEffect(() => {
        setAuthor(metadata?.author || '');
        setUrl(metadata?.url || '');
        setDate(metadata?.publishedDate || '');
    }, [metadata]);

    const handleChange = (field: keyof NonNullable<Note['metadata']>, value: string) => {
        const newMetadata = { ...metadata, [field]: value };
        onChange(newMetadata);
    };

    if (readOnly) {
        return (
            <div className="flex flex-col gap-2 p-3 bg-neutral-50 rounded-md text-sm border border-neutral-200 mb-4">
                {author && <div className="flex items-center gap-2"><User size={14} className="text-neutral-500" /> <span>{author}</span></div>}
                {date && <div className="flex items-center gap-2"><Calendar size={14} className="text-neutral-500" /> <span>{date}</span></div>}
                {url && (
                    <div className="flex items-center gap-2">
                        <LinkIcon size={14} className="text-neutral-500" />
                        <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate max-w-full">
                            {url}
                        </a>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 p-3 bg-neutral-50 rounded-md border border-neutral-200 mb-4 transition-all duration-200 shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-neutral-700 font-semibold text-sm w-full hover:text-primary-600 transition-colors py-1"
            >
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                <BookOpen size={18} />
                <span>Source Metadata</span>
                {!isOpen && (author || date) && (
                    <span className="text-xs text-neutral-400 font-normal ml-auto truncate max-w-[150px]">
                        {[author, date].filter(Boolean).join(' • ')}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200 pt-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-neutral-500 font-medium ml-1">Author</label>
                        <div className="flex items-center bg-white border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-primary-100 transition-shadow">
                            <User size={16} className="text-neutral-400 mr-2" />
                            <input
                                type="text"
                                className="w-full bg-transparent outline-none text-sm min-h-[20px]"
                                placeholder="Author Name"
                                value={author}
                                onChange={(e) => {
                                    setAuthor(e.target.value);
                                    handleChange('author', e.target.value);
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-neutral-500 font-medium ml-1">Year / Date</label>
                        <div className="flex items-center bg-white border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-primary-100 transition-shadow">
                            <Calendar size={16} className="text-neutral-400 mr-2" />
                            <input
                                type="text"
                                className="w-full bg-transparent outline-none text-sm min-h-[20px]"
                                placeholder="YYYY or Date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    handleChange('publishedDate', e.target.value);
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                        <label className="text-xs text-neutral-500 font-medium ml-1">URL / Link</label>
                        <div className="flex items-center bg-white border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-primary-100 transition-shadow">
                            <LinkIcon size={16} className="text-neutral-400 mr-2" />
                            <input
                                type="text"
                                className="w-full bg-transparent outline-none text-sm min-h-[20px]"
                                placeholder="https://..."
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    handleChange('url', e.target.value);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
