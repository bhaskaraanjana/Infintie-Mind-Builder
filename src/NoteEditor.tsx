import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from './store';
import { X, Trash2, Maximize2, Minimize2, GripHorizontal } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { EditorToolbar } from './components/EditorToolbar';
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

    sources,
    setSources, // Array handler
    sourceInput,
    setSourceInput,
    handleAddSource,
    removeSource,
    isSaving,
    lastSaved,
    editingNoteId,
    setEditingNoteId,
    viewportHeight,
    keyboardOpen
}: any) => {
    const [editorInstance, setEditorInstance] = useState<any>(null);

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'note-editor-window',
    });

    const style = {
        transform: CSS.Translate.toString(transform) ?
            `translate(-50%, -50%) translate3d(${coordinates.x + (transform?.x || 0)}px, ${coordinates.y + (transform?.y || 0)}px, 0)` :
            `translate(-50%, -50%) translate3d(${coordinates.x}px, ${coordinates.y}px, 0)`,
        maxHeight: keyboardOpen ? `${viewportHeight - 20}px` : undefined, // Adjust for keyboard
        top: keyboardOpen ? `${viewportHeight / 2}px` : '50%', // Keep centered in visible area
    };

    // If expanded, disable custom transform and use fixed inset
    // When keyboard is open on mobile, visualViewport height shrinks
    const panelStyle = isExpanded ? {
        height: keyboardOpen ? `${viewportHeight}px` : '100%',
        bottom: keyboardOpen ? 'auto' : 0 // Ensure it doesn't get covered
    } : style;
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
                            onClick={handleSave}
                            className={styles.iconButton}
                            title="Close"
                        >
                            <X size={20} color="var(--theme-text)" />
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.controlsBar}>
                {isExpanded && (
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

                        {/* Legacy Source Input Removed */}
                    </div>
                )}
                {/* External Toolbar */}
                {isExpanded && editorInstance && (
                    <EditorToolbar editor={editorInstance} />
                )}
            </div>

            <div className={styles.contentArea}>
                <RichTextEditor
                    key={editingNoteId}
                    content={content}
                    onChange={setContent}
                    onStatsChange={setEditorStats}
                    isExpanded={isExpanded}
                    showToolbar={false} // Use external toolbar
                    onEditorReady={setEditorInstance}
                />
            </div>

            <div className={styles.tagsSection}>
                {type === 'literature' && (
                    <div className={styles.sourceSection} style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--neutral-600)' }}>Sources</div>
                        <div className={styles.tagsList}>
                            {sources.map((src: string, i: number) => (
                                <span key={i} className={styles.tag} style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                                    {src}
                                    <button
                                        onClick={() => removeSource(i)}
                                        className={styles.tagRemoveButton}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={sourceInput}
                            onChange={(e) => setSourceInput(e.target.value)}
                            onKeyDown={handleAddSource}
                            placeholder="Add source (Press Enter)..."
                            className={styles.tagInput} // Reuse tag input style
                        />
                    </div>
                )}

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
    const [sources, setSources] = useState<string[]>([]);
    const [sourceInput, setSourceInput] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [editorStats, setEditorStats] = useState({ words: 0, characters: 0 });

    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

    const note = editingNoteId ? notes[editingNoteId] : null;

    // Virtual Keyboard Handling
    const [viewportHeight, setViewportHeight] = useState(window.visualViewport?.height || window.innerHeight);
    const [keyboardOpen, setKeyboardOpen] = useState(false);

    // REFS to hold latest state for unmount saving (The "Safety Net")
    const noteStateRef = useRef({ title, content, noteTags, type, sources });

    // Update refs whenever state changes
    useEffect(() => {
        noteStateRef.current = { title, content, noteTags, type, sources };
    }, [title, content, noteTags, type, sources]);

    useEffect(() => {
        if (!window.visualViewport) return;

        const handleResize = () => {
            const currentHeight = window.visualViewport?.height || window.innerHeight;
            setViewportHeight(currentHeight);
            setKeyboardOpen(currentHeight < window.innerHeight * 0.85); // Threshold for keyboard detection
        };

        window.visualViewport.addEventListener('resize', handleResize);
        window.visualViewport.addEventListener('scroll', handleResize);

        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
            window.visualViewport?.removeEventListener('scroll', handleResize);
        };
    }, []);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content || '');
            setNoteTags(note.tags || []);
            setType(note.type);
            setSources(note.sources || (note.source ? [note.source] : []));
        }
    }, [editingNoteId, note]);

    // Autosave State
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Unified Save Function (Reads from Refs for safety)
    const saveChanges = useCallback((immediate = false) => {
        if (!editingNoteId) return;

        const current = noteStateRef.current;
        console.log('💾 Saving note:', editingNoteId, immediate ? '(Immediate)' : '(Debounced)');

        updateNote(editingNoteId, {
            title: current.title,
            content: current.content,
            tags: current.noteTags,
            type: current.type,
            sources: current.type === 'literature' ? current.sources : undefined,
            source: current.type === 'literature' ? (current.sources[0] || '') : undefined
        }, { immediate });
        setLastSaved(new Date());
    }, [editingNoteId, updateNote]);

    // Autosave Effect (500ms Debounce)
    useEffect(() => {
        if (!editingNoteId) return;

        setIsSaving(true);
        const timer = setTimeout(() => {
            saveChanges(false);
            setIsSaving(false);
        }, 500); // Faster feedback

        return () => clearTimeout(timer);
    }, [title, content, noteTags, type, sources, editingNoteId, saveChanges]);

    // Unmount / Close Protection
    useEffect(() => {
        return () => {
            if (editingNoteId) {
                console.log('🚪 Editor closing/unmounting, forcing save...');
                // We MUST call the save logic here. 
                // However, we cannot call 'saveChanges' directly if it's in the dependency array
                // because that would trigger this effect constantly.
                // Instead, we implement the save logic directly reading from the Ref.

                const current = noteStateRef.current;
                useStore.getState().updateNote(editingNoteId, {
                    title: current.title,
                    content: current.content,
                    tags: current.noteTags,
                    type: current.type,
                    sources: current.type === 'literature' ? current.sources : undefined,
                    source: current.type === 'literature' ? (current.sources[0] || '') : undefined
                }, { immediate: true }); // FORCE IMMEDIATE SAVE
            }
        };
    }, [editingNoteId]); // Only re-bind when the Note ID changes (switching notes)

    const handleSave = () => {
        saveChanges(true); // Explicit Save is Immediate
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

    const handleAddSource = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = sourceInput.trim();
            if (val) {
                setSources([...sources, val]);
                setSourceInput('');
            }
        }
    };

    const removeSource = (index: number) => {
        setSources(sources.filter((_, i) => i !== index));
    };

    if (!editingNoteId) return null;

    const dragContent = (
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
            sources={sources}
            setSources={setSources}
            sourceInput={sourceInput}
            setSourceInput={setSourceInput}
            handleAddSource={handleAddSource}
            removeSource={removeSource}
            isSaving={isSaving}
            lastSaved={lastSaved}
            setEditingNoteId={setEditingNoteId}
            editingNoteId={editingNoteId}
            viewportHeight={viewportHeight}
            keyboardOpen={keyboardOpen}
        />
    );

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            {dragContent}
        </DndContext>
    );
};
