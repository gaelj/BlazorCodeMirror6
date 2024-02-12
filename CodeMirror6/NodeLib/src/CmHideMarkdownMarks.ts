import { syntaxTree } from '@codemirror/language'
import { RangeSet, StateField } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'
import type { EditorState, Extension, Range } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { buildWidget } from './lib/codemirror-kit'
import { isCursorInRange } from './CmHelpers'

const hideWidget = () => buildWidget({
    eq: () => false,
    toDOM: () => {
        const span = document.createElement('span');
        return span;
    },
})

export const hideMarksExtension = (enabled: boolean = true): Extension => {
    if (!enabled)
        return []

    const hideDecoration = () => Decoration.replace({
        widget: hideWidget(),
    })

    const decorate = (state: EditorState) => {
        const widgets: Range<Decoration>[] = [];

        if (enabled) {
            syntaxTree(state).iterate({
                enter: ({ node, type, from, to }) => {
                    if (type.name.endsWith('Mark') && type.name !== 'ListMark') {
                        if (type.name === 'CodeMark') {
                            const eFC = node.parent
                            if (eFC.type.name === 'FencedCode') {
                                const cursorFrom = state.doc.lineAt(eFC.from).from
                                const cursorTo = state.doc.lineAt(eFC.to).to
                                if (isCursorInRange(state, cursorFrom, cursorTo)) {
                                    return
                                }
                            }
                        }

                        let cursorRange: { from: number, to: number }
                        const mark = state.sliceDoc(from, to)
                        cursorRange = state.doc.lineAt(from)
                        if (mark.startsWith('#')) {
                            to += 1 // Hide the space character after the #'s
                        }
                        if (isCursorInRange(state, cursorRange.from, cursorRange.to)) return
                        widgets.push(hideDecoration().range(from, to))
                    }
                },
            })
        }

        return widgets.length > 0 ? RangeSet.of(widgets) : Decoration.none;
    }

    const viewPlugin = ViewPlugin.define(() => ({}), {})
    const stateField = StateField.define<DecorationSet>({
        create(state) {
            return decorate(state)
        },
        update(_references, { state }) {
            return decorate(state)
        },
        provide(field) {
            return EditorView.decorations.from(field)
        },
    })

    return [
        viewPlugin,
        stateField,
    ]
}
