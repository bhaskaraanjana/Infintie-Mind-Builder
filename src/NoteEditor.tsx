import { useState, useEffect } from 'react';
import { useStore } from './store';
import { X, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import styles from './NoteEditor.module.css';

export const NoteEditor = () => {
    const editingNoteId = useStore((state) => state.editingNoteId);
    const notes = useStore((state) => state.notes);
    const updateNote = useStore((state) => state.updateNote);
    const deleteNote = useStore((state) => state.deleteNote);
    const setEditingNoteId = useStore((state) => state.setEditingNoteId);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [noteTags, setNoteTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [type, setType] = useState<'fleeting' | 'literature' | 'permanent' | 'hub'>('fleeting');
    const [source, setSource] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [editorStats, setEditorStats] = useState({ words: 0, characters: 0 });

    const note = editingNoteId ? notes[editingNoteId] : null;

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content || '');
            setNoteTags(note.tags || []);
            setType(note.type);
            setSource(note.source || '');
        }
    }, [editingNoteId, note]);

    const handleSave = () => {
        if (editingNoteId) {
            updateNote(editingNoteId, {
                title,
                content,
                tags: noteTags,
                type,
                source: type === 'literature' ? source : undefined
            });
        }
        setEditingNoteId(null);
        setIsExpanded(false);
    };

    const handleDelete = () => {
        if (editingNoteId) {
            deleteNote(editingNoteId);
        }
        setEditingNoteId(null);
        setIsExpanded(false);
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            const newTag = tagInput.trim();
            if (!noteTags.includes(newTag)) {
                setNoteTags([...noteTags, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setNoteTags(noteTags.filter((tag) => tag !== tagToRemove));
    };

    if (!editingNoteId) return null;

    const editorContent = (
        <div className={`${styles.editorContent} ${isExpanded ? styles.expandedEditorContent : ''}`}>
            <div className={styles.header}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note Title"
                    className={styles.titleInput}
                />
                <div className={styles.headerButtons}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={styles.iconButton}
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        {isExpanded ? <Minimize2 size={20} color="var(--theme-text)" /> : <Maximize2 size={20} color="var(--theme-text)" />}
                    </button>
                    {!isExpanded && (
                        <button
                            onClick={() => setEditingNoteId(null)}
                            className={styles.iconButton}
                            title="Close"
                        >
                            <X size={20} color="var(--theme-text)" />
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.typeSelector}>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className={styles.select}
                >
                    <option value="fleeting">Fleeting</option>
                    <option value="literature">Literature</option>
                    <option value="permanent">Permanent</option>
                    <option value="hub">Hub</option>
                </select>

                {type === 'literature' && (
                    <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="Source (URL, Book, etc.)"
                        className={styles.sourceInput}
                    />
                )}
            </div>

            <div className={styles.contentArea}>
                <RichTextEditor
                    content={content}
                    onChange={setContent}
                    onStatsChange={setEditorStats}
                    isExpanded={isExpanded}
                />
            </div>

            <div className={styles.tagsSection}>
                <div className={styles.tagsList}>
                    {noteTags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                            {tag}
                            <button
                                onClick={() => removeTag(tag)}
                                className={styles.tagRemoveButton}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tags..."
                    className={styles.tagInput}
                />
            </div>

            <div className={styles.footer}>
                <div className={styles.footerStats}>
                    {editorStats.words}w • {editorStats.characters}c
                </div>
                <button
                    onClick={handleDelete}
                    className={styles.deleteButton}
                    title="Delete Note"
                >
                    <Trash2 size={20} />
                </button>
                <button
                    onClick={handleSave}
                    className={styles.saveButton}
                >
                    Save
                </button>
            </div>
        </div>
    );

    if (isExpanded) {
        return (
            <div className={styles.expandedPanel}>
                <div className={styles.expandedContent}>
                    {editorContent}
                    <button
                        onClick={() => setIsExpanded(false)}
                        className={styles.closeButton}
                        title="Close Full Screen"
                    >
                        <X size={24} color="var(--theme-text)" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.editorPanel}>
            {editorContent}
        </div>
    );
};
