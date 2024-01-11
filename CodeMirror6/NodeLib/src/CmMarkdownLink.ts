import { Extension, RangeSetBuilder } from "@codemirror/state"
import { EditorView, Decoration, ViewPlugin } from "@codemirror/view"
import { isCursorInRange, isInCodeBlock } from "./CmHelpers"
import { buildWidget } from "./lib/codemirror-kit"
import { markdownLanguage } from "@codemirror/lang-markdown"

const linkRegex = /\!?\[([^\]]*)\]\([^\)]+\)/g

export function createMarkdownLinkExtension(): Extension {
    return ViewPlugin.define(
        (view: EditorView) => {
            return {
                update: () => {
                    const builder = new RangeSetBuilder<Decoration>()
                    for (const { from, to } of view.visibleRanges) {
                        const text = view.state.doc.sliceString(from, to)
                        let match
                        while ((match = linkRegex.exec(text))) {
                            const start = from + match.index
                            const end = start + match[0].length
                            if (!isCursorInRange(view.state, start, end)) {
                                const isCode = isInCodeBlock(view.state, start)
                                if (!isCode) {
                                    const linkName = match[1]
                                    const widget = createMarkdownLinkWidget(match[0], linkName)
                                    builder.add(start, end, widget)
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
        }
    )
}

function createMarkdownLinkWidget(rawLinkText: string, linkName: string) {
    return Decoration.replace({
        widget: buildWidget({
            eq: (other) => other.linkText === rawLinkText,
            toDOM: () => {
                const span = document.createElement("span")
                span.textContent = linkName
                if (linkName)
                    span.className = "cm-md-link-detail"
                return span
            },
            ignoreEvent: () => false,
            linkText: rawLinkText
        }),
    })
}

function createMarkdownLinkDecorationPlugin(): Extension {
    return ViewPlugin.define(
        (view: EditorView) => {
            return {
                update: () => {
                    const builder = new RangeSetBuilder<Decoration>()

                    for (const { from, to } of view.visibleRanges) {
                        if (markdownLanguage.isActiveAt(view.state, from)) {
                            const text = view.state.doc.sliceString(from, to)
                            let match
                            while ((match = linkRegex.exec(text))) {
                                const start = from + match.index + 1
                                const end = start + match[0].length
                                const isCode = isInCodeBlock(view.state, start)
                                if (!isCode) {
                                    builder.add(start, end, Decoration.mark({ class: "cm-md-link" }))
                                }
                            }
                        }
                    }

                    return builder.finish()
                },
            }
        },
        {
            decorations: plugin => plugin.update()
        }
    )
}

// Combine the extension with the mention plugin
export const markdownLinkExtension = (stylingEnabled: boolean) => [
    stylingEnabled ? createMarkdownLinkExtension() : [],
    stylingEnabled ? createMarkdownLinkDecorationPlugin() : [],
]
