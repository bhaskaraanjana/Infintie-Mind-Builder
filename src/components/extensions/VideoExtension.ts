import { Node, mergeAttributes } from '@tiptap/core';

export interface VideoOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        video: {
            setVideo: (options: { src: string }) => ReturnType;
        };
    }
}

export const VideoExtension = Node.create<VideoOptions>({
    name: 'video',

    addOptions() {
        return {
            HTMLAttributes: {
                controls: true,
                style: 'width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;',
            },
        };
    },

    group: 'block',

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'video',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['video', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },

    addCommands() {
        return {
            setVideo: options => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                });
            },
        };
    },
});
