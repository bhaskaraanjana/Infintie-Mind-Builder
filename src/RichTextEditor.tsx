import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { WikiLink } from './components/extensions/WikiLink';
import { Search } from './components/extensions/Search';
import suggestion from './components/extensions/mentionSuggestion';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, all } from 'lowlight';
import Placeholder from '@tiptap/extension-placeholder';
// import Image from '@tiptap/extension-image'; // Replaced by custom extension
import { ImageExtension } from './components/extensions/ImageExtension';
import { VideoExtension } from './components/extensions/VideoExtension';
import Youtube from '@tiptap/extension-youtube';
import { useEffect, useCallback, useState } from 'react';
import {
    Bold, Italic, Strikethrough, Code,
    Heading1, Heading2, List, ListOrdered,
    Image as ImageIcon, Youtube as YoutubeIcon, Quote,
    Undo2, Redo2, Table as TableIcon,
    Upload
} from 'lucide-react';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { uploadFile } from './services/storageService';

interface Props {
    content: string;
    onChange: (content: string) => void;
    onStatsChange?: (stats: { words: number; characters: number }) => void;
    editable?: boolean;
    isExpanded?: boolean;
    showToolbar?: boolean;
    onEditorReady?: (editor: any) => void;
    onWikiLinkClick?: (noteId: string) => void;
}

// Helper to count words
const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Create lowlight instance with all languages
const lowlight = createLowlight(all);

export const RichTextEditor = ({ content, onChange, onStatsChange, editable = true, isExpanded = false, onEditorReady, onWikiLinkClick }: Props) => {
    const [isUploading, setIsUploading] = useState(false);

    // Handle wiki-link clicks
    useEffect(() => {
        if (!onWikiLinkClick) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('wiki-link')) {
                e.preventDefault();
                const noteId = target.getAttribute('data-note-id');
                if (noteId) {
                    onWikiLinkClick(noteId);
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [onWikiLinkClick]);

    const handleFileUpload = async (file: File, view: any, pos?: number) => {
        setIsUploading(true);
        try {
            const url = await uploadFile(file, 'note-images');
            if (view && !view.isDestroyed) {
                const transactions = view.state.tr.insert(
                    pos ?? view.state.selection.from,
                    view.state.schema.nodes.image.create({ src: url })
                );
                view.dispatch(transactions);
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image.");
        } finally {
            setIsUploading(false);
        }
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Placeholder.configure({
                placeholder: 'Write something amazing...',
            }),
            ImageExtension.configure({
                inline: true,
                allowBase64: true,
            }),
            VideoExtension,
            Youtube.configure({
                controls: false,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
            WikiLink.configure({
                suggestion: {
                    ...suggestion,
                    char: '[',
                    allowSpaces: true,
                    command: ({ editor, range, props }: any) => {
                        // Delete the extra [ that was typed before the trigger
                        const from = range.from - 1; // Go back one more to delete the first [
                        editor
                            .chain()
                            .focus()
                            .deleteRange({ from: from >= 0 ? from : range.from, to: range.to })
                            .insertContent({
                                type: 'mention',
                                attrs: {
                                    id: props.noteId || props.id,
                                    label: props.label || props.id,
                                },
                            })
                            .insertContent(' ')
                            .run();
                    },
                },
            }),
            Search,
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
            handleDrop: (view, event, _slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                    const files = Array.from(event.dataTransfer.files);
                    const images = files.filter(file => file.type.startsWith('image/'));
                    if (images.length > 0) {
                        event.preventDefault();
                        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
                        images.forEach(image => {
                            handleFileUpload(image, view, pos);
                        });
                        return true;
                    }
                }
                return false;
            },
            handlePaste: (view, event) => {
                const items = Array.from(event.clipboardData?.items || []);
                const images = items.filter(item => item.type.startsWith('image/'));

                if (images.length > 0) {
                    event.preventDefault();
                    images.forEach(item => {
                        const file = item.getAsFile();
                        if (file) {
                            handleFileUpload(file, view);
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
                    color: var(--text);
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: var(--textSecondary);
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                
                /* Wiki-Link Styling */
                .ProseMirror .wiki-link {
                    color: var(--primary-500);
                    background-color: rgba(14, 165, 233, 0.1);
                    padding: 2px 4px;
                    border-radius: 4px;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    font-weight: 500;
                }
                .ProseMirror .wiki-link:hover {
                    background-color: rgba(14, 165, 233, 0.2);
                    color: var(--primary-600);
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
                    outline: 2px solid var(--primary-500);
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
                    border: 2px solid var(--border);
                    padding: 0.5rem;
                    vertical-align: top;
                    position: relative;
                }

                .ProseMirror table th {
                    font-weight: bold;
                    text-align: left;
                    background-color: var(--canvasBg);
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

                /* Search Styling */
                .ProseMirror .search-result {
                    background-color: rgba(255, 219, 77, 0.4);
                    border-radius: 2px;
                }
                .ProseMirror .search-result-current {
                    background-color: rgba(255, 165, 0, 0.6);
                    border-bottom: 2px solid orange;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div >
    );
};
