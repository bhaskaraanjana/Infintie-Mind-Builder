import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import MentionList from './MentionList'
import { useStore } from '../../store'

export default {
    items: ({ query }: { query: string }) => {
        const store = useStore.getState()
        const notes = Object.values(store.notes)

        // Filter notes by title and return with noteId
        return notes
            .filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()))
            .slice(0, 5)
            .map(note => ({
                id: note.title, // Used for display
                label: note.title,
                noteId: note.id, // Actual note ID for linking
            }))
    },

    render: () => {
        let component: any
        let popup: any

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(MentionList, {
                    props,
                    editor: props.editor,
                })

                if (!props.clientRect) {
                    return
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                })
            },

            onUpdate(props: any) {
                component.updateProps(props)

                if (!props.clientRect) {
                    return
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                })
            },

            onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                    popup[0].hide()

                    return true
                }

                return component.ref?.onKeyDown(props)
            },

            onExit() {
                if (popup && popup[0] && !popup[0].state?.isDestroyed) {
                    popup[0].destroy()
                }
                component.destroy()
            },
        }
    },
}
