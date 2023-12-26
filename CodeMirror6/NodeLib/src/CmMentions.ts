import { autocompletion, Completion, CompletionContext, CompletionSource } from "@codemirror/autocomplete"
import { markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState, RangeSetBuilder, Extension } from '@codemirror/state'
import { EditorView, ViewPlugin, Decoration } from "@codemirror/view"
import { syntaxTree } from '@codemirror/language'

function createMentionsCompletionSource(dotnetHelper: any): CompletionSource {
    return async (context: CompletionContext) => {
        let options: Completion[] = []
        let from = context.pos

        if (context.matchBefore(/(?:\s|^)@/)) {
            options = await getMentionCompletionsFromDotNet(dotnetHelper, null)
        }
        else if (context.matchBefore(/(?:\s|^)@(\w+)/)) {
            const mentionsRegex = /(?:\s|^)(?:@)(\w*)/
            const match = context.matchBefore(mentionsRegex)
            const matchText = match ? match.text : null
            const matchSearchText = mentionsRegex.exec(matchText)
            const searchText = matchSearchText ? matchSearchText[1] : null
            if (match) from = match.from + 1 // Set the starting position to the first character after the @
            options = await getMentionCompletionsFromDotNet(dotnetHelper, searchText)
        }

        return {
            from: from,
            options: options,
            validFor: /^[\w@]*$/,
        }
    }
}

async function getMentionCompletionsFromDotNet(dotnetHelper: any, firstCharacters: string | null): Promise<Completion[]> {
    try {
        return await dotnetHelper.invokeMethodAsync('GetMentionCompletionsFromJS', firstCharacters)
    } catch (error) {
        console.error('Error fetching mention completions:', error)
        return []
    }
}

export function createMentionsCompletionExtension(dotnetHelper: any, enabled: boolean): Extension {
    if (!enabled)
        return autocompletion()
    const mentionsCompletionSource = createMentionsCompletionSource(dotnetHelper);
    return autocompletion({
        override: [mentionsCompletionSource]
    });
}

function isInCodeBlock(state: EditorState, pos: number) {
    let tree = syntaxTree(state).resolve(pos, -1)
    while (tree.parent) {
        if (tree.name === 'CodeText' || tree.name === 'FencedCodeBlock' || tree.name === 'FencedCode' || tree.name === 'CodeBlock')
            return true
        tree = tree.parent
    }
    return false
}

const mentionRegex = /(?:\s|^)@\w+/g;
const mentionDecorationPlugin = ViewPlugin.define(
    (view: EditorView) => {
        return {
            update: () => {
                const builder = new RangeSetBuilder<Decoration>()

                for (const { from, to } of view.visibleRanges) {
                    if (markdownLanguage.isActiveAt(view.state, from)) {
                        const text = view.state.doc.sliceString(from, to)
                        let match
                        while ((match = mentionRegex.exec(text))) {
                            const start = from + match.index + 1
                            const end = start + match[0].length
                            const isCode = isInCodeBlock(view.state, start)
                            if (!isCode) {
                                builder.add(start, end, Decoration.mark({ class: "mention" }))
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
function createMentionDecorationPlugin(enabled: boolean): Extension {
    if (!enabled)
        return []
    return mentionDecorationPlugin
}

// Combine the extension with the mention plugin
export const mentionExtension = (dotnetHelper: any, completionEnabled: boolean, stylingEnabled: boolean) => [
    createMentionsCompletionExtension(dotnetHelper, completionEnabled),
    createMentionDecorationPlugin(stylingEnabled)
]
