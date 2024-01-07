import { Extension, Range, RangeSetBuilder } from "@codemirror/state"
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view"
import { syntaxTree } from "@codemirror/language"
import { isCursorInRange, isInCodeBlock } from "./CmHelpers"
import { buildWidget } from "./lib/codemirror-kit"
import { markdownLanguage } from "@codemirror/lang-markdown"

const linkRegex = /\[([^\]]+)\]\([^\)]+\)/g

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
                                    if (!linkName || linkName === "") continue
                                    if (linkName) {
                                        const widget = createMarkdownLinkWidget(match[0], linkName)
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

function createMarkdownLinkWidget(rawLinkText: string, linkName: string) {
    return Decoration.replace({
        widget: buildWidget({
            eq: (other) => other.linkText === rawLinkText,
            toDOM: () => {
                const span = document.createElement("span")
                span.textContent = linkName
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
    createMarkdownLinkExtension(),
    stylingEnabled ? createMarkdownLinkDecorationPlugin() : [],
]

/* // Function to create the Markdown link extension
export function markdownLinkExtension(): Extension {
    const linkDecoration = (linkText: string, linkName: string) => Decoration.replace({
        widget: buildWidget({
            eq: (other) => other.linkText === linkText,
            toDOM: () => {
                const span = document.createElement("span")
                span.textContent = linkName
                span.className = "cm-md-link"
                return span
            },
            ignoreEvent: () => false,
            linkText: linkText
        }),
    })

    function extractLinkName(text: string): string {
        const match = text.match(linkRegex);
        return match ? match[1] : "";
    }


    return ViewPlugin.fromClass(class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = this.buildDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.selectionSet) {
                this.decorations = this.buildDecorations(update.view);
            }
        }

        buildDecorations(view: EditorView): DecorationSet {
            const decorations: Range<Decoration>[] = [];

            syntaxTree(view.state).iterate({
                enter: ({ type, from, to }) => {
                    if (type.name === "Link") {
                        // Ignore image links
                        const linkText = view.state.doc.sliceString(from, to);
                        if (!linkText.startsWith('!')) {
                            const isNear = isCursorInRange(view.state, from, to);
                            if (!isNear) {
                                // Create a decoration for link text
                                decorations.push(linkDecoration(linkText, extractLinkName(linkText)).range(from, to));
                            }
                        }
                    }
                }
            });

            return Decoration.set(decorations);
        }
    });
}
 */
