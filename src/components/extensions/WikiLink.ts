import { Mention } from '@tiptap/extension-mention';

/**
 * WikiLink Extension
 * 
 * Extends TipTap's Mention to create Obsidian-style [[wiki-links]].
 * - Renders as <a class="wiki-link" data-note-id="..." data-note-title="...">[[Title]]</a>
 * - Parses <a class="wiki-link"> elements back to Mention nodes on load
 */
export const WikiLink = Mention.extend({
    name: 'mention',

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: element => element.getAttribute('data-note-id'),
                renderHTML: attributes => {
                    if (!attributes.id) return {};
                    return { 'data-note-id': attributes.id };
                },
            },
            label: {
                default: null,
                parseHTML: element => element.getAttribute('data-note-title'),
                renderHTML: attributes => {
                    if (!attributes.label) return {};
                    return { 'data-note-title': attributes.label };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'a.wiki-link',
                getAttrs: element => {
                    const el = element as HTMLElement;
                    return {
                        id: el.getAttribute('data-note-id'),
                        label: el.getAttribute('data-note-title'),
                    };
                },
            },
            // Also parse the default mention span format
            {
                tag: `span[data-type="${this.name}"]`,
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        return [
            'a',
            {
                ...HTMLAttributes,
                class: 'wiki-link',
                'data-note-id': node.attrs.id,
                'data-note-title': node.attrs.label,
                href: '#',
            },
            `[[${node.attrs.label || node.attrs.id}]]`,
        ];
    },
});
