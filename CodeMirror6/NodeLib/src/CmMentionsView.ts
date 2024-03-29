import { markdownLanguage } from "@codemirror/lang-markdown"
import { RangeSetBuilder, Extension } from '@codemirror/state'
import { EditorView, ViewPlugin, Decoration } from "@codemirror/view"
import { buildWidget } from "./lib/codemirror-kit"
import { cachedCompletions } from "./CmMentionsCompletion"
import { isCursorInRange, isInCodeBlock } from "./CmHelpers"

const mentionsRegex = /(?:\s|^)(?:@)(\w*)/g

function createMentionDetailsPlugin(): Extension {
    return ViewPlugin.define(
        (view: EditorView) => {
            return {
                update: () => {
                    const builder = new RangeSetBuilder<Decoration>()
                    for (const { from, to } of view.visibleRanges) {
                        const text = view.state.doc.sliceString(from, to)
                        let match
                        while ((match = mentionsRegex.exec(text))) {
                            const start = from + match.index + match[0].indexOf('@')
                            const end = start + match[1].length + 1
                            if (!isCursorInRange(view.state, start, end)) {
                                const isCode = isInCodeBlock(view.state, start)
                                if (!isCode) {
                                    const mentionText = match[1]
                                    if (!mentionText || mentionText === "") continue
                                    const detail = getMentionDetail(mentionText) // Fetch the detail for the mention
                                    if (detail) {
                                        const widget = createMentionWidget(detail)
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
        }
    )
}

function createMentionWidget(detail: string) {
    return Decoration.replace({
        widget: buildWidget({
            eq: (other) => other.detail === detail,
            toDOM: () => {
                const span = document.createElement("span")
                span.textContent = detail
                span.className = "cm-mention-detail"
                return span
            },
            ignoreEvent: () => false,
            detail: detail
        }),
    })
}

function getMentionDetail(mentionText: string) {
    const cachedCompletion = cachedCompletions.find(cached => cached.label === mentionText)
    if (cachedCompletion) {
        return cachedCompletion.detail
    }
}

function createMentionDecorationPlugin(): Extension {
    return ViewPlugin.define(
        (view: EditorView) => {
            return {
                update: () => {
                    const builder = new RangeSetBuilder<Decoration>()

                    for (const { from, to } of view.visibleRanges) {
                        if (markdownLanguage.isActiveAt(view.state, from)) {
                            const text = view.state.doc.sliceString(from, to)
                            let match
                            while ((match = mentionsRegex.exec(text))) {
                                const start = from + match.index + 1
                                const end = start + match[0].length
                                const isCode = isInCodeBlock(view.state, start)
                                if (!isCode) {
                                    builder.add(start, end, Decoration.mark({ class: "cm-mention" }))
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
export const mentionDecorationExtension = (enabled: boolean) => [
    createMentionDecorationPlugin(),
    enabled ? createMentionDetailsPlugin() : [],
]
