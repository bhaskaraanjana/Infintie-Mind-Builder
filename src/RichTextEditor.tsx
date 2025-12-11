import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, all } from 'lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { useEffect, useCallback } from 'react';
import {
    Bold, Italic, Strikethrough, Code,
    Heading1, Heading2, List, ListOrdered,
    Image as ImageIcon, Youtube as YoutubeIcon, Quote,
    Undo2, Redo2, Table as TableIcon
} from 'lucide-react';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

interface Props {
    content: string;
    onChange: (content: string) => void;
    onStatsChange?: (stats: { words: number; characters: number }) => void;
    editable?: boolean;
    isExpanded?: boolean;
    showToolbar?: boolean; // Control toolbar visibility
}

// Helper to count words
const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Create lowlight instance with all languages
const lowlight = createLowlight(all);

export const RichTextEditor = ({ content, onChange, onStatsChange, editable = true, isExpanded = false, showToolbar = true }: Props) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // Disable default to use lowlight version
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Placeholder.configure({
                placeholder: 'Write something amazing...',
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Youtube.configure({
                controls: false,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
            if (onStatsChange) {
                const text = editor.getText();
                onStatsChange({
                    words: countWords(text),
                    characters: text.length,
                });
            }
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-4 ${isExpanded ? 'max-w-none' : ''}`,
            },
            handlePaste: (view, event) => {
                const items = Array.from(event.clipboardData?.items || []);
                const images = items.filter(item => item.type.indexOf('image') === 0);

                if (images.length > 0) {
                    event.preventDefault();
                    images.forEach(item => {
                        const blob = item.getAsFile();
                        if (blob) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const result = e.target?.result;
                                if (typeof result === 'string') {
                                    view.dispatch(view.state.tr.replaceSelectionWith(
                                        view.state.schema.nodes.image.create({ src: result })
                                    ));
                                }
                            };
                            reader.readAsDataURL(blob);
                        }
                    });
                    return true;
                }
                return false;
            }
        },
    });

    // Update editor content if external content changes (and is different)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            if (editor.getText() === '' && content) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    const addYoutubeVideo = useCallback(() => {
        const url = prompt('Enter YouTube URL');
        if (url && editor) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    }, [editor]);

    const addImage = useCallback(() => {
        const url = prompt('Enter Image URL');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={`rich-text-editor ${isExpanded ? 'expanded' : ''}`}>
            {/* Always-visible formatting toolbar (only in expanded mode) */}
            {editor && showToolbar && (
                <div className="formatting-toolbar">
                    {/* Undo/Redo */}
                    <button
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="toolbar-btn"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="toolbar-btn"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo2 size={18} />
                    </button>

                    <div className="toolbar-divider" />

                    {/* Text formatting */}
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
                        title="Strikethrough"
                    >
                        <Strikethrough size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={`toolbar-btn ${editor.isActive('code') ? 'is-active' : ''}`}
                        title="Inline Code"
                    >
                        <Code size={18} />
                    </button>

                    <div className="toolbar-divider" />

                    {/* Headings */}
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
                        title="Heading 1"
                    >
                        <Heading1 size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
                        title="Heading 2"
                    >
                        <Heading2 size={18} />
                    </button>

                    <div className="toolbar-divider" />

                    {/* Lists */}
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
                        title="Bullet List"
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
                        title="Numbered List"
                    >
                        <ListOrdered size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
                        title="Quote"
                    >
                        <Quote size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        className="toolbar-btn"
                        title="Insert Table"
                    >
                        <TableIcon size={18} />
                    </button>

                    <div className="toolbar-divider" />

                    {/* Media */}
                    <button
                        onClick={addImage}
                        className="toolbar-btn"
                        title="Add Image"
                    >
                        <ImageIcon size={18} />
                    </button>
                    <button
                        onClick={addYoutubeVideo}
                        className="toolbar-btn"
                        title="Add YouTube Video"
                    >
                        <YoutubeIcon size={18} />
                    </button>
                </div>
            )}
            {editor && (
                <BubbleMenu className="bubble-menu glass" tippyOptions={{ duration: 100 }} editor={editor}>
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'is-active' : ''}
                        title="Bold"
                    >
                        <Bold size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'is-active' : ''}
                        title="Italic"
                    >
                        <Italic size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={editor.isActive('strike') ? 'is-active' : ''}
                        title="Strike"
                    >
                        <Strikethrough size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={editor.isActive('code') ? 'is-active' : ''}
                        title="Code"
                    >
                        <Code size={16} />
                    </button>
                </BubbleMenu>
            )}

            {editor && (
                <FloatingMenu className="floating-menu glass" tippyOptions={{ duration: 100 }} editor={editor}>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                        title="Heading 1"
                    >
                        <Heading1 size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                        title="Heading 2"
                    >
                        <Heading2 size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'is-active' : ''}
                        title="Bullet List"
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'is-active' : ''}
                        title="Ordered List"
                    >
                        <ListOrdered size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={editor.isActive('blockquote') ? 'is-active' : ''}
                        title="Quote"
                    >
                        <Quote size={18} />
                    </button>
                    <div className="separator" />
                    <button onClick={addImage} title="Add Image">
                        <ImageIcon size={18} />
                    </button>
                    <button onClick={addYoutubeVideo} title="Add YouTube Video">
                        <YoutubeIcon size={18} />
                    </button>
                </FloatingMenu>
            )}

            <EditorContent editor={editor} />

            <style>{`
                .rich-text-editor {
                    position: relative;
                }
                .ProseMirror {
                    outline: none;
                    min-height: 200px;
                    color: var(--theme-text);
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: var(--theme-text-secondary);
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                
                /* Formatting Toolbar - Touch Optimized */
                .formatting-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.5rem;
                    background: var(--glass-bg);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--theme-border);
                    border-radius: 0.5rem;
                    margin-bottom: 0.75rem;
                    overflow-x: auto;
                    overflow-y: hidden;
                    flex-wrap: wrap;
                }
                
                .toolbar-btn {
                    min-width: 44px;
                    min-height: 44px;
                    padding: 12px;
                    background: transparent;
                    border: none;
                    color: var(--theme-text-secondary);
                    cursor: pointer;
                    border-radius: 0.375rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }
                
                .toolbar-btn:hover:not(:disabled) {
                    background: var(--glass-border);
                    color: var(--theme-text);
                }
                
                .toolbar-btn.is-active {
                    background: var(--theme-primary);
                    color: white;
                }
                
                .toolbar-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                
                .toolbar-divider {
                    width: 1px;
                    height: 24px;
                    background: var(--theme-border);
                    margin: 0 0.25rem;
                    flex-shrink: 0;
                }
                
                /* Responsive toolbar */
                    .formatting-toolbar {
                        flex-wrap: nowrap;
                        overflow-x: scroll;
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: none; /* Firefox */
                        -ms-overflow-style: none; /* IE 10+ */
                    }
                    .formatting-toolbar::-webkit-scrollbar {
                        display: none; /* Chrome/Safari */
                    }
                }
                
                .bubble-menu, .floating-menu {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.5rem;
                    border-radius: 0.75rem;
                    background-color: var(--glass-bg);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--glass-border);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    animation: fadeIn 0.2s ease-out;
                }
                .bubble-menu button, .floating-menu button {
                    background: transparent;
                    border: none;
                    color: var(--theme-text-secondary);
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .bubble-menu button:hover, .floating-menu button:hover,
                .bubble-menu button.is-active, .floating-menu button.is-active {
                    background-color: var(--theme-primary);
                    color: white;
                    transform: translateY(-1px);
                }
                .separator {
                    width: 1px;
                    height: 20px;
                    background-color: var(--theme-border);
                    margin: 0 4px;
                }
                
                /* Image Styling */
                .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 1rem 0;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .ProseMirror img.ProseMirror-selectednode {
                    outline: 2px solid var(--theme-primary);
                }

                /* YouTube Styling */
                .ProseMirror div[data-youtube-video] {
                    cursor: move;
                    padding-right: 24px;
                }
                .ProseMirror iframe {
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    margin: 1rem 0;
                    width: 100%;
                    aspect-ratio: 16/9;
                }

                /* Table Styling */
                .ProseMirror table {
                    border-collapse: collapse;
                    table-layout: auto;
                    width: 100%;
                    margin: 1rem 0;
                    overflow: hidden;
                }

                .ProseMirror table td,
                .ProseMirror table th {
                    min-width: 100px;
                    border: 2px solid var(--theme-border);
                    padding: 0.5rem;
                    vertical-align: top;
                    position: relative;
                }

                .ProseMirror table th {
                    font-weight: bold;
                    text-align: left;
                    background-color: var(--theme-canvas-bg);
                }

                .ProseMirror table .selectedCell {
                    background-color: rgba(14, 165, 233, 0.1);
                }

                /* Mobile responsive table scroll */
                @media (max-width: 768px) {
                    .ProseMirror table {
                        display: block;
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
