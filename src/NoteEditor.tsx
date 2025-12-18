import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from './store';
import { X, Trash2, Maximize2, Minimize2, GripHorizontal, Tag, BookOpen, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { EditorToolbar } from './components/EditorToolbar';
import styles from './NoteEditor.module.css';
import { DndContext, useDraggable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { SourceMetadata } from './types';

// Specialized Components
import { LiteratureMetadata } from './components/note-types/LiteratureMetadata';
import { HubPanel } from './components/note-types/HubPanel';
import { BacklinksPanel } from './components/note-types/BacklinksPanel';
import { FleetingActions } from './components/note-types/FleetingActions';
import { TagsPanel } from './components/note-types/TagsPanel';

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
    setNoteTags, // New Prop
    removeTag,
    tagInput,
    setTagInput,
    handleAddTag,
    type,
    setType,

    sources,
    setSources, // Legacy Array handler 

    // New Source Manager Props
    sourcesMetadata,
    setSourcesMetadata,

    isSaving,
    lastSaved,
    editingNoteId,
    setEditingNoteId,
    viewportHeight,
    keyboardOpen,

    // Legacy Single Metadata 
    metadata,
    setMetadata,

    // Accordion State
    activeMetadataPanel,
    setActiveMetadataPanel
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

    const panelStyle = isExpanded ? {
        height: keyboardOpen ? `${viewportHeight}px` : '100%',
        bottom: keyboardOpen ? 'auto' : 0
    } : style;
    const panelClass = isExpanded ? styles.expandedPanel : styles.editorPanel;

    // Handle fleeting conversions
    const handleConvertToPermanent = () => {
        setType('permanent');
    };

    const handleConvertToLiterature = () => {
        setType('literature');
    };

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
                    </div>
                )}
                {/* External Toolbar */}
                {isExpanded && editorInstance && (
                    <EditorToolbar editor={editorInstance} />
                )}
            </div>

            {/* Hub: Connections Panel (Top) */}
            {
                type === 'hub' && (
                    <HubPanel
                        noteId={editingNoteId}
                        clusterId={useStore.getState().notes[editingNoteId]?.clusterId}
                        onNavigate={(id) => {
                            handleSave();
                            setEditingNoteId(id);
                        }}
                    />
                )
            }

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

            {/* Permanent: Backlinks */}
            {
                type === 'permanent' && (
                    <BacklinksPanel
                        noteId={editingNoteId}
                        onNavigate={(id) => {
                            handleSave();
                            setEditingNoteId(id);
                        }}
                    />
                )
            }



            {/* Footer Metadata Tabs */}
            <div className="mt-4">
                <div className="flex items-center gap-1 border-b border-neutral-200">
                    {type === 'fleeting' && (
                        <button
                            onClick={() => setActiveMetadataPanel(activeMetadataPanel === 'actions' ? null : 'actions')}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors rounded-t-md ${activeMetadataPanel === 'actions'
                                    ? 'border-primary-500 text-primary-700 bg-primary-50/30'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                                }`}
                        >
                            <Zap size={16} />
                            <span>Process Note</span>
                            {activeMetadataPanel === 'actions' ? <ChevronDown size={14} className="ml-1 opacity-50" /> : <ChevronRight size={14} className="ml-1 opacity-50" />}
                        </button>
                    )}

                    {type === 'literature' && (
                        <button
                            onClick={() => setActiveMetadataPanel(activeMetadataPanel === 'sources' ? null : 'sources')}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors rounded-t-md ${activeMetadataPanel === 'sources'
                                    ? 'border-primary-500 text-primary-700 bg-primary-50/30'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                                }`}
                        >
                            <BookOpen size={16} />
                            <span>Sources <span className="text-neutral-500 font-normal">({sourcesMetadata.length})</span></span>
                            {activeMetadataPanel === 'sources' ? <ChevronDown size={14} className="ml-1 opacity-50" /> : <ChevronRight size={14} className="ml-1 opacity-50" />}
                        </button>
                    )}

                    <button
                        onClick={() => setActiveMetadataPanel(activeMetadataPanel === 'tags' ? null : 'tags')}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors rounded-t-md ${activeMetadataPanel === 'tags'
                                ? 'border-primary-500 text-primary-700 bg-primary-50/30'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                            }`}
                    >
                        <Tag size={16} />
                        <span>Tags <span className="text-neutral-500 font-normal">({noteTags.length})</span></span>
                        {activeMetadataPanel === 'tags' ? <ChevronDown size={14} className="ml-1 opacity-50" /> : <ChevronRight size={14} className="ml-1 opacity-50" />}
                    </button>
                </div>

                {/* Tab Content Panel */}
                {activeMetadataPanel && (
                    <div className="bg-neutral-50 border-x border-b border-neutral-200 rounded-b-md p-3 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                        {activeMetadataPanel === 'actions' && type === 'fleeting' && (
                            <FleetingActions
                                onConvertToPermanent={handleConvertToPermanent}
                                onConvertToLiterature={handleConvertToLiterature}
                                isOpen={true}
                                hideHeader={true}
                            />
                        )}

                        {activeMetadataPanel === 'sources' && type === 'literature' && (
                            <LiteratureMetadata
                                sources={sourcesMetadata}
                                onChange={setSourcesMetadata}
                                readOnly={!isExpanded && false}
                                metadata={metadata}
                                isOpen={true}
                                hideHeader={true}
                            />
                        )}

                        {activeMetadataPanel === 'tags' && (
                            <TagsPanel
                                tags={noteTags}
                                onAddTag={(tag) => {
                                    const newTag = tag.trim();
                                    if (newTag && !noteTags.includes(newTag)) {
                                        if (setNoteTags) {
                                            setNoteTags([...noteTags, newTag]);
                                        }
                                    }
                                }}
                                onRemoveTag={removeTag}
                                readOnly={!isExpanded && false}
                                isOpen={true}
                                hideHeader={true}
                            />
                        )}
                    </div>
                )}
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
        </div >
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

    const note = editingNoteId ? notes[editingNoteId] : null;

    // Initialize state directly from note to prevent race conditions
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [noteTags, setNoteTags] = useState<string[]>(note?.tags || []);
    const [type, setType] = useState<'fleeting' | 'literature' | 'permanent' | 'hub'>(note?.type || 'fleeting');
    const [isExpanded, setIsExpanded] = useState(false);
    const [editorStats, setEditorStats] = useState({ words: 0, characters: 0 });

    const [metadata, setMetadata] = useState(note?.metadata || {});
    const [sourcesMetadata, setSourcesMetadata] = useState<SourceMetadata[]>(note?.sourcesMetadata || []);

    // Metadata Accordion State
    const [activeMetadataPanel, setActiveMetadataPanel] = useState<'sources' | 'tags' | 'actions' | null>(null);



    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

    const [viewportHeight, setViewportHeight] = useState(window.visualViewport?.height || window.innerHeight);
    const [keyboardOpen, setKeyboardOpen] = useState(false);

    const noteStateRef = useRef({ title, content, noteTags, type, metadata, sourcesMetadata });

    useEffect(() => {
        noteStateRef.current = { title, content, noteTags, type, metadata, sourcesMetadata };
    }, [title, content, noteTags, type, metadata, sourcesMetadata]);

    useEffect(() => {
        if (!window.visualViewport) return;

        const handleResize = () => {
            const currentHeight = window.visualViewport?.height || window.innerHeight;
            setViewportHeight(currentHeight);
            setKeyboardOpen(currentHeight < window.innerHeight * 0.85);
        };

        window.visualViewport.addEventListener('resize', handleResize);
        window.visualViewport.addEventListener('scroll', handleResize);

        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
            window.visualViewport?.removeEventListener('scroll', handleResize);
        };
    }, []);

    const activeNoteIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (note && note.id !== activeNoteIdRef.current) {
            activeNoteIdRef.current = note.id;

            setTitle(note.title);
            setContent(note.content || '');
            setNoteTags(note.tags || []);
            setType(note.type);
            setMetadata(note.metadata || {});
            setSourcesMetadata(note.sourcesMetadata || []);
        }
    }, [editingNoteId, note]);

    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const saveChanges = useCallback((immediate = false) => {
        if (!editingNoteId) return;

        const current = noteStateRef.current;
        console.log('💾 Saving note:', editingNoteId, immediate ? '(Immediate)' : '(Debounced)');

        updateNote(editingNoteId, {
            title: current.title,
            content: current.content,
            tags: current.noteTags,
            type: current.type,
            metadata: current.metadata,
            sourcesMetadata: current.sourcesMetadata
        }, { immediate });
        setLastSaved(new Date());
    }, [editingNoteId, updateNote]);

    useEffect(() => {
        if (!editingNoteId) return;

        setIsSaving(true);
        const timer = setTimeout(() => {
            saveChanges(false);
            setIsSaving(false);
            setLastSaved(new Date());
        }, 1000);

        return () => clearTimeout(timer);
    }, [title, content, noteTags, type, metadata, sourcesMetadata, editingNoteId, saveChanges]);

    useEffect(() => {
        return () => {
            if (editingNoteId) {
                console.log('🚪 Editor closing/unmounting, forcing save...');

                const current = noteStateRef.current;
                useStore.getState().updateNote(editingNoteId, {
                    title: current.title,
                    content: current.content,
                    tags: current.noteTags,
                    type: current.type,
                    metadata: current.metadata,
                    sourcesMetadata: current.sourcesMetadata
                }, { immediate: true });
            }
        };
    }, [editingNoteId]);

    const handleSave = () => {
        saveChanges(true);
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
            setNoteTags={setNoteTags}
            removeTag={removeTag}

            type={type}
            setType={setType}

            isSaving={isSaving}
            lastSaved={lastSaved}
            setEditingNoteId={setEditingNoteId}
            editingNoteId={editingNoteId}
            viewportHeight={viewportHeight}
            keyboardOpen={keyboardOpen}
            metadata={metadata}
            setMetadata={setMetadata}
            sourcesMetadata={sourcesMetadata}
            setSourcesMetadata={setSourcesMetadata}
            activeMetadataPanel={activeMetadataPanel}
            setActiveMetadataPanel={setActiveMetadataPanel}
        />
    );

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            {dragContent}
        </DndContext>
    );
};
