import React, { useState, useEffect } from 'react';
import { Save, X, BookOpen, User, Calendar, Link as LinkIcon } from 'lucide-react';
import type { SourceMetadata } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface SourceFormProps {
    source?: SourceMetadata; // If present, we are editing
    onSave: (source: SourceMetadata) => void;
    onCancel: () => void;
}

export const SourceForm: React.FC<SourceFormProps> = ({ source, onSave, onCancel }) => {
    const [title, setTitle] = useState(source?.title || '');
    const [author, setAuthor] = useState(source?.author || '');
    const [year, setYear] = useState(source?.publishedDate || '');
    const [url, setUrl] = useState(source?.url || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: source?.id || uuidv4(),
            title,
            author,
            publishedDate: year,
            url
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded-md border border-primary-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-xs font-bold text-primary-700 uppercase tracking-wide mb-3">
                {source ? 'Edit Source' : 'Add New Source'}
            </h4>

            <div className="space-y-3">
                {/* Title */}
                <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Title / Name</label>
                    <div className="flex items-center bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                        <BookOpen size={16} className="text-neutral-400 mr-2" />
                        <input
                            type="text"
                            className="w-full bg-transparent outline-none text-sm min-h-[22px]"
                            placeholder="e.g. The Pragmatic Programmer"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                </div>

                {/* Author */}
                <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Author</label>
                    <div className="flex items-center bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                        <User size={16} className="text-neutral-400 mr-2" />
                        <input
                            type="text"
                            className="w-full bg-transparent outline-none text-sm min-h-[22px]"
                            placeholder="e.g. Andy Hunt"
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Year */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1">Year</label>
                        <div className="flex items-center bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                            <Calendar size={16} className="text-neutral-400 mr-2" />
                            <input
                                type="text"
                                className="w-full bg-transparent outline-none text-sm min-h-[22px]"
                                placeholder="YYYY"
                                value={year}
                                onChange={e => setYear(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1">URL</label>
                        <div className="flex items-center bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                            <LinkIcon size={16} className="text-neutral-400 mr-2" />
                            <input
                                type="text"
                                className="w-full bg-transparent outline-none text-sm min-h-[22px]"
                                placeholder="https://..."
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-neutral-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md shadow-sm transition-all active:scale-95"
                >
                    <Save size={16} />
                    Save Source
                </button>
            </div>
        </form>
    );
};
