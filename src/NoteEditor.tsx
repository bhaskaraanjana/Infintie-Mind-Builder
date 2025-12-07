import { useState, useEffect } from 'react';
import { useStore } from './store';
import { X, Trash2, Maximize2, Minimize2, GripHorizontal } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import styles from './NoteEditor.module.css';
import { DndContext, useDraggable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const DraggableEditorContent = ({
    coordinates,
    handleSave,
    handleDelete,
    isExpanded,
    setIsExpanded,
    editorStats,
    setEditorStats,
    title,
    setTitle,
    content,
    setContent,
    noteTags,
    removeTag,
    tagInput,
    setTagInput,
    handleAddTag,
    type,
    setType,
    source,
    setSource,
    isSaving,
    lastSaved,
    setEditingNoteId
}: any) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'note-editor-window',
    });

    const style = {
        transform: CSS.Translate.toString(transform) ?
            `translate(-50%, -50%) translate3d(${coordinates.x + (transform?.x || 0)}px, ${coordinates.y + (transform?.y || 0)}px, 0)` :
            `translate(-50%, -50%) translate3d(${coordinates.x}px, ${coordinates.y}px, 0)`,
    };

    // If expanded, disable custom transform and use fixed inset
    const panelStyle = isExpanded ? {} : style;
    const panelClass = isExpanded ? styles.expandedPanel : styles.editorPanel;

    const editorContent = (
        <div className={`${styles.editorContent} ${isExpanded ? styles.expandedEditorContent : ''}`}>
            <div className={styles.header}>
                <div
                    {...attributes}
                    {...listeners}
                    className={styles.dragHandle}
                    title="Drag to move"
                >
                    <GripHorizontal size={20} color="var(--theme-text-secondary)" />
                </div>
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
                {isExpanded && (
                    <>
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
                    </>
                )}
            </div>

            <div className={styles.contentArea}>
                <RichTextEditor
                    content={content}
                    onChange={setContent}
                    onStatsChange={setEditorStats}
                    isExpanded={isExpanded}
                    showToolbar={isExpanded}
                />
            </div>

            <div className={styles.tagsSection}>
                <div className={styles.tagsList}>
                    {noteTags.map((tag: string) => (
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
                <div className={styles.autoSaveIndicator}>
                    {isSaving ? (
                        <span className={styles.saving}>Saving...</span>
                    ) : lastSaved ? (
                        <span className={styles.saved}>
                            Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    ) : null}
                </div>
                <button
                    onClick={handleDelete}
                    className={styles.deleteButton}
                    title="Delete Note"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );

    if (isExpanded) {
        return (
            <div className={panelClass}>
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
        <div
            ref={setNodeRef}
            style={panelStyle}
            className={panelClass}
        >
            {editorContent}
        </div>
    );
};

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

    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

    const note = editingNoteId ? notes[editingNoteId] : null;

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content || '');
            setNoteTags(note.tags || []);
            setType(note.type);
            setSource(note.source || '');
            // Reset position when opening a new note (optional, maybe keep it?)
            // setCoordinates({ x: 0, y: 0 }); 
        }
    }, [editingNoteId, note]);

    // Autosave with 2-second debounce
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        if (!editingNoteId) return;

        setIsSaving(true);
        const timer = setTimeout(() => {
            updateNote(editingNoteId, {
                title,
                content,
                tags: noteTags,
                type,
                source: type === 'literature' ? source : undefined
            });
            setIsSaving(false);
            setLastSaved(new Date());
        }, 2000);

        return () => clearTimeout(timer);
    }, [title, content, noteTags, type, source, editingNoteId, updateNote]);

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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { delta } = event;
        setCoordinates(({ x, y }) => ({
            x: x + delta.x,
            y: y + delta.y,
        }));
    };

    if (!editingNoteId) return null;

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <DraggableEditorContent
                coordinates={coordinates}
                handleSave={handleSave}
                handleDelete={handleDelete}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                editorStats={editorStats}
                setEditorStats={setEditorStats}
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
                noteTags={noteTags}
                removeTag={removeTag}
                tagInput={tagInput}
                setTagInput={setTagInput}
                handleAddTag={handleAddTag}
                type={type}
                setType={setType}
                source={source}
                setSource={setSource}
                isSaving={isSaving}
                lastSaved={lastSaved}
                setEditingNoteId={setEditingNoteId}
            />
        </DndContext>
    );
};
