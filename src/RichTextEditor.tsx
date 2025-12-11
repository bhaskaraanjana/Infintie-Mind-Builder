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
    showToolbar?: boolean; // Legacy prop, can be ignored if external toolbar starts used
    onEditorReady?: (editor: any) => void;
}

// Helper to count words
const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Create lowlight instance with all languages
const lowlight = createLowlight(all);

export const RichTextEditor = ({ content, onChange, onStatsChange, editable = true, isExpanded = false, showToolbar = true, onEditorReady }: Props) => {
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

    // Expose editor instance
    useEffect(() => {
        if (editor && onEditorReady) {
            onEditorReady(editor);
        }
    }, [editor, onEditorReady]);

    if (!editor) {
        return null;
    }

    return (
        <div className={`rich-text-editor ${isExpanded ? 'expanded' : ''}`}>
            {/* Internal Toolbar Removed - use <EditorToolbar /> externally */}
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
        </div >
    );
};
