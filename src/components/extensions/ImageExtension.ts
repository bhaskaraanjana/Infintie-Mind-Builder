import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ResizableImage } from './ResizableImage';

export interface ImageOptions {
    inline: boolean;
    allowBase64: boolean;
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        image: {
            setImage: (options: { src: string; alt?: string; title?: string; width?: string | number; align?: 'left' | 'center' | 'right' }) => ReturnType;
        };
    }
}

export const ImageExtension = Node.create<ImageOptions>({
    name: 'image',

    addOptions() {
        return {
            inline: false,
            allowBase64: false,
            HTMLAttributes: {},
        };
    },

    inline() {
        return this.options.inline;
    },

    group() {
        return this.options.inline ? 'inline' : 'block';
    },

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
            title: {
                default: null,
            },
            width: {
                default: '100%',
                renderHTML: attributes => {
                    return {
                        width: attributes.width,
                    }
                }
            },
            align: {
                default: 'center',
                renderHTML: attributes => {
                    return {
                        'data-align': attributes.align,
                    }
                }
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'img[src]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },

    addCommands() {
        return {
            setImage: options => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                });
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImage);
    },
});
