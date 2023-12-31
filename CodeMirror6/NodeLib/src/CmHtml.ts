import { syntaxTree } from '@codemirror/language'
import { RangeSet, StateField } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'
import type { EditorState, Extension, Range } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { buildWidget } from './lib/codemirror-kit'
import { isCursorInRange } from './CmHelpers'

const htmlWidget = (content: string) => buildWidget({
    eq: () => false,
    toDOM: () => {
        const container = document.createElement('span');
        container.innerHTML = content; // Insert HTML content
        return container;
    },
})

export const viewInlineHtmlExtension = (enabled: boolean = true): Extension => {
    if (!enabled)
        return []

    const htmlDecoration = (content: string) => Decoration.replace({
        widget: htmlWidget(content),
    })

    const decorate = (state: EditorState) => {
        const widgets: Range<Decoration>[] = [];

        if (enabled) {
            let foundClosingTag = true
            let htmlCode = ''
            let paragraph = ''
            let paragraphFrom = 0
            let paragraphTo = 0
            syntaxTree(state).iterate({
                enter: ({ type, from, to }) => {
                    const text = state.sliceDoc(from, to)
                    if (type.name === 'Paragraph') {
                        paragraph = text
                        paragraphFrom = from
                        paragraphTo = to
                    }
                    else if (type.name === 'HTMLTag') {
                        foundClosingTag = !foundClosingTag
                        htmlCode += text
                        if (htmlCode !== '' && paragraph !== '' && foundClosingTag) {
                            if (!isCursorInRange(state, paragraphFrom, paragraphTo)) {
                                widgets.push(htmlDecoration(paragraph).range(paragraphFrom, paragraphTo))
                            }
                            htmlCode = ''
                            paragraph = ''
                        }
                    }
                    else {
                        if (!foundClosingTag) htmlCode += text
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
