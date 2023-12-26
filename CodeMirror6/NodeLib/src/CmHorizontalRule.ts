import { syntaxTree } from '@codemirror/language'
import { RangeSet, StateField } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'
import type { EditorState, Extension, Range } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { buildWidget } from './lib/codemirror-kit'

const hrWidget = () => buildWidget({
    eq: () => false,
    toDOM: () => {
        const hr = document.createElement('hr');
        hr.setAttribute('aria-hidden', 'true');
        return hr;
    },
})

const hasOverlap = (x1: number, x2: number, y1: number, y2: number) => {
    return Math.max(x1, y1) <= Math.min(x2, y2)
}

export const isCursorInRange = (state: EditorState, from: number, to: number) => {
    return state.selection.ranges.some((range) => {
        return hasOverlap(from, to, range.from, range.to)
    })
}

/**
 * Return the horizontal rule Extension if the supplied parameter is true
 * @param autoFormatMarkdown
 * @returns
 */
export const dynamicHrExtension = (enableHr: boolean = true): Extension => {
    if (!enableHr) {
        // If the extension is disabled, return an empty extension
        return []
    }

    const hrDecoration = () => Decoration.replace({
        widget: hrWidget(),
    })

    const decorate = (state: EditorState) => {
        const widgets: Range<Decoration>[] = [];

        if (enableHr) {
            syntaxTree(state).iterate({
                enter: ({ type, from, to }) => {
                    if (type.name === 'HorizontalRule' && !isCursorInRange(state, from, to)) {
                        const line = state.doc.lineAt(from)
                        const lineText = state.doc.sliceString(line.from, line.to)
                        const hrRegex = /^-{3,}$/

                        if (hrRegex.test(lineText)) {
                            widgets.push(hrDecoration().range(line.from, line.to))
                        }
                    }
                },
            })
        }

        return widgets.length > 0 ? RangeSet.of(widgets) : Decoration.none;
    };

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
