import {
    Bold, Italic, Strikethrough, Code,
    Heading1, Heading2, List, ListOrdered,
    Image as ImageIcon, Youtube as YoutubeIcon, Quote,
    Undo2, Redo2, Table as TableIcon, Upload, Search
} from 'lucide-react';
import { type Editor } from '@tiptap/react';
import './EditorToolbar.css';
import { useCallback, useRef } from 'react';
import { uploadFile } from '../services/storageService';
interface EditorToolbarProps {
    editor: Editor | null;
    className?: string;
    onSearchClick?: () => void;
}

export const EditorToolbar = ({ editor, className = '', onSearchClick }: EditorToolbarProps) => {
    if (!editor) return null;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const addYoutubeVideo = useCallback(() => {
        const url = prompt('Enter YouTube URL');
        if (url) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    }, [editor]);

    const addImage = useCallback(() => {
        const url = prompt('Enter Image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Determine path based on type
                const path = file.type.startsWith('video/') ? 'note-videos' : 'note-images';
                const url = await uploadFile(file, path);

                if (file.type.startsWith('image/')) {
                    editor.chain().focus().setImage({ src: url }).run();
                } else if (file.type.startsWith('video/')) {
                    editor.chain().focus().setVideo({ src: url }).run();
                }
            } catch (error) {
                console.error("Upload failed", error);
                alert("Failed to upload media");
            } finally {
                // Reset input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    return (
        <div className={`editor-toolbar ${className}`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                style={{ display: 'none' }}
            />

            {/* Search (Local) */}
            <button
                onClick={() => onSearchClick?.()}
                className="toolbar-btn"
                title="Find in Note"
            >
                <Search size={18} />
            </button>

            <div className="toolbar-divider" />

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
                title="Add Image from URL"
            >
                <ImageIcon size={18} />
            </button>
            <button
                onClick={handleUploadClick}
                className="toolbar-btn"
                title="Insert Media"
            >
                <Upload size={18} />
            </button>
            <button
                onClick={addYoutubeVideo}
                className="toolbar-btn"
                title="Add YouTube Video"
            >
                <YoutubeIcon size={18} />
            </button>
        </div>
    );
};
