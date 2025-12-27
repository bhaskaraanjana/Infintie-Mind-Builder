import { Extension } from '@tiptap/core'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Node as ProsemirrorNode } from '@tiptap/pm/model'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        search: {
            setSearchTerm: (term: string) => ReturnType
            clearSearch: () => ReturnType
            findNext: () => ReturnType
            findPrevious: () => ReturnType
            replace: (replacement: string) => ReturnType
            replaceAll: (replacement: string) => ReturnType
        }
    }
}

interface SearchOptions {
    searchTerm: string
    searchResultClass: string
    searchResultCurrentClass: string
    caseSensitive: boolean
}

interface SearchStorage {
    results: { from: number; to: number }[]
    currentIndex: number
}

export const Search = Extension.create<SearchOptions, SearchStorage>({
    name: 'search',

    addOptions() {
        return {
            searchTerm: '',
            searchResultClass: 'search-result',
            searchResultCurrentClass: 'search-result-current',
            caseSensitive: false,
        }
    },

    addStorage() {
        return {
            results: [],
            currentIndex: -1
        }
    },

    addCommands() {
        return {
            setSearchTerm: (term: string) => ({ state, dispatch, editor }) => {
                this.options.searchTerm = term

                // Update results
                const results: { from: number; to: number }[] = []
                if (term) {
                    const regex = new RegExp(
                        term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                        this.options.caseSensitive ? 'g' : 'gi'
                    )
                    state.doc.descendants((node, pos) => {
                        if (!node.isText) return
                        if (!node.text) return

                        let match
                        while ((match = regex.exec(node.text)) !== null) {
                            results.push({
                                from: pos + match.index,
                                to: pos + match.index + match[0].length
                            })
                        }
                    })
                }

                this.storage.results = results
                this.storage.currentIndex = -1

                // Trigger update
                if (dispatch) {
                    // Force re-render of decorations by dispatching a meta transaction
                    dispatch(state.tr.setMeta('search', { term }))
                }
                return true
            },
            clearSearch: () => ({ state, dispatch }) => {
                this.options.searchTerm = ''
                this.storage.results = []
                this.storage.currentIndex = -1
                if (dispatch) dispatch(state.tr.setMeta('search', { term: '' }))
                return true
            },
            findNext: () => ({ editor, view }) => {
                const { results, currentIndex } = this.storage
                if (!results.length) return false

                let nextIndex = currentIndex + 1
                if (nextIndex >= results.length) nextIndex = 0

                this.storage.currentIndex = nextIndex
                const target = results[nextIndex]

                // Scroll and select
                editor.commands.setTextSelection(target)
                editor.commands.scrollIntoView()

                // Force decoration update to highlight "current"
                view.dispatch(view.state.tr.setMeta('search', { index: nextIndex }))

                return true
            },
            findPrevious: () => ({ editor, view }) => {
                const { results, currentIndex } = this.storage
                if (!results.length) return false

                let nextIndex = currentIndex - 1
                if (nextIndex < 0) nextIndex = results.length - 1

                this.storage.currentIndex = nextIndex
                const target = results[nextIndex]

                editor.commands.setTextSelection(target)
                editor.commands.scrollIntoView()

                view.dispatch(view.state.tr.setMeta('search', { index: nextIndex }))

                return true
            },
            replace: (replacement: string) => ({ state, dispatch }) => {
                const { results, currentIndex } = this.storage
                if (!results.length || currentIndex === -1) return false

                const target = results[currentIndex]

                if (dispatch) {
                    state.tr.insertText(replacement, target.from, target.to)
                    // We dispatch a transaction. The plugin's apply method will see docChanged=true 
                    // and re-scan, preserving currentIndex logic is tricky but handled by re-scan or reset.
                    // Let's rely on standard re-scan.
                    dispatch(state.tr.insertText(replacement, target.from, target.to))
                }
                return true
            },
            replaceAll: (replacement: string) => ({ state, dispatch }) => {
                const { results } = this.storage
                if (!results.length) return false

                if (dispatch) {
                    const tr = state.tr
                    for (let i = results.length - 1; i >= 0; i--) {
                        const target = results[i]
                        tr.insertText(replacement, target.from, target.to)
                    }
                    dispatch(tr)
                }
                return true
            }
        }
    },

    addProseMirrorPlugins() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const extensionThis = this

        return [
            new Plugin({
                key: new PluginKey('search'),
                state: {
                    init() {
                        return DecorationSet.empty
                    },
                    apply(tr, old) {
                        // Re-calculate decorations if document changed OR search meta present
                        const meta = tr.getMeta('search')

                        // If document changed, we must re-scan because positions shifted
                        if (!tr.docChanged && !meta) {
                            return old
                        }

                        const searchTerm = extensionThis.options.searchTerm
                        if (!searchTerm) return DecorationSet.empty

                        const decorations: Decoration[] = []
                        const regex = new RegExp(
                            searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                            extensionThis.options.caseSensitive ? 'g' : 'gi'
                        )

                        const results: { from: number; to: number }[] = []

                        tr.doc.descendants((node, pos) => {
                            if (!node.isText) return

                            let match
                            while ((match = regex.exec(node.text || '')) !== null) {
                                const from = pos + match.index
                                const to = from + match[0].length
                                results.push({ from, to })

                                // Add decoration
                                // Check if this is the "current" index? 
                                // Need to match exactly by position or use storage index
                                // But apply runs before storage update in some cases? 
                                // Actually storage is persistent across transactions if mutated in commands.
                            }
                        })

                        // Update storage with new positions (if doc changed)
                        if (tr.docChanged) {
                            extensionThis.storage.results = results
                            // Try to map current index? Complex. Just reset or keep approximate?
                            // Simple reset if doc changes for now to avoid crashes
                            // extensionThis.storage.currentIndex = -1 
                        }

                        // Generate decorations
                        results.forEach((res, index) => {
                            const isCurrent = index === extensionThis.storage.currentIndex
                            decorations.push(
                                Decoration.inline(res.from, res.to, {
                                    class: isCurrent ? extensionThis.options.searchResultCurrentClass : extensionThis.options.searchResultClass
                                })
                            )
                        })

                        return DecorationSet.create(tr.doc, decorations)
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state)
                    },
                },
            }),
        ]
    },
})
