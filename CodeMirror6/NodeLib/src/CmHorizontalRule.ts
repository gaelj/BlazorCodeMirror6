import { syntaxTree } from '@codemirror/language'
import { RangeSet, StateField } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'
import type { EditorState, Extension, Range } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { buildWidget } from './lib/codemirror-kit'
import { isCursorInRange } from './CmHelpers'


/**
 * Return the horizontal rule Extension if the supplied parameter is true
 * @param enabled
 * @returns
 */
export const dynamicHrExtension = (enabled: boolean = true): Extension => {
    if (!enabled)
        return []

    const createHRDecorationWidget = () => Decoration.replace({
        widget: buildWidget({
            eq: () => false,
            toDOM: () => {
                const hr = document.createElement('hr')
                hr.setAttribute('aria-hidden', 'true')
                return hr
            },
            ignoreEvent: () => false,
        }),
    })

    const decorate = (state: EditorState) => {
        const widgets: Range<Decoration>[] = [];

        if (enabled) {
            syntaxTree(state).iterate({
                enter: ({ type, from, to }) => {
                    if (type.name === 'HorizontalRule' && !isCursorInRange(state, from, to)) {
                        const line = state.doc.lineAt(from)
                        const lineText = state.doc.sliceString(line.from, line.to)
                        const hrRegex = /^-{3,}$/

                        if (hrRegex.test(lineText)) {
                            widgets.push(createHRDecorationWidget().range(line.from, line.to))
                        }
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
        update(_references, transaction) {
            return decorate(transaction.state)
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
