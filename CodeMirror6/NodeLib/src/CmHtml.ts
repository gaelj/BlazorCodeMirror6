import { syntaxTree } from '@codemirror/language'
import { RangeSet, StateField, RangeSetBuilder } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'
import type { EditorState, Extension, Range } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { markdownLanguage } from "@codemirror/lang-markdown"
import { buildWidget } from './lib/codemirror-kit'
import { isCursorInRange, isInCodeBlock } from './CmHelpers'


function createHtmlDecorationWidget(content: string) {
    return Decoration.replace({
        widget: buildWidget({
            eq: (other) => other.content === content,
            toDOM: () => {
                const container = document.createElement('span')
                container.innerHTML = content
                return container
            },
            ignoreEvent: () => false,
            content: content
        }),
    })
}

export function htmlViewPlugin(enabled: boolean): Extension {
    if (!enabled) return []
    return ViewPlugin.define((view: EditorView) => {
        return {
            update: () => {
                const builder = new RangeSetBuilder<Decoration>()
                for (const { from, to } of view.visibleRanges) {
                    const text = view.state.doc.sliceString(from, to)

                    if (markdownLanguage.isActiveAt(view.state, from)) {
                        // recognize html spans (<span>...</span>) and decorate them
                        const spanRegex = /<span[^>]*>([^<]*)<\/span>/g
                        let match
                        while ((match = spanRegex.exec(text)) !== null) {
                            const start = from + match.index
                            const end = start + match[0].length
                            if (!isCursorInRange(view.state, start, end)) {
                                const isCode = isInCodeBlock(view.state, start)
                                if (!isCode) {
                                    const spanText = match[1]
                                    if (!spanText || spanText === "") continue
                                    const widget = createHtmlDecorationWidget(match[0])
                                    builder.add(start, end, widget)
                                }
                            }
                        }
                    }
                }
                return builder.finish();
            },
        }
    },
    {
        decorations: plugin => plugin.update()
    })
}
