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
                enter: ({ type, from, to }) => {
                    if (type.name.endsWith('Mark') && type.name !== 'ListMark') {
                        const mark = state.sliceDoc(from, to)
                        const line = state.doc.lineAt(from)
                        if (mark.startsWith('#')) {
                            to += 1 // Hide the space character after the #'s
                        }
                        if (!isCursorInRange(state, line.from, line.to))
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
