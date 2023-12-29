import { autocompletion, Completion, CompletionContext, CompletionSource } from "@codemirror/autocomplete"
import { markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState, RangeSetBuilder, Extension } from '@codemirror/state'
import { EditorView, ViewPlugin, Decoration } from "@codemirror/view"
import { syntaxTree } from '@codemirror/language'
import { buildWidget } from "./lib/codemirror-kit"

const mentionsRegex = /(?:\s|^)(?:@)(\w*)/g

function createMentionsCompletionSource(dotnetHelper: any): CompletionSource {
    return async (context: CompletionContext) => {
        let options: Completion[] = []
        let from = context.pos

        /* if (context.matchBefore(/(?:\s|^)@/)) {
            options = await getMentionCompletionsFromDotNet(dotnetHelper, null)
        }
        else  */
        if (context.matchBefore(mentionsRegex)) {
            const tokensBefore = context.tokenBefore([])
            console.log('tokensBefore', tokensBefore)
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

function createMentionDetailsPlugin(dotnetHelper: any) {
    return ViewPlugin.define(
        (view: EditorView) => {
            // You might want to store and manage mention details here
            // For example, using a Map or fetching details from your backend

            return {
                update: () => {
                    const builder = new RangeSetBuilder<Decoration>();

                    for (const { from, to } of view.visibleRanges) {
                        if (markdownLanguage.isActiveAt(view.state, from)) {
                            const text = view.state.doc.sliceString(from, to);
                            let match;
                            while ((match = mentionsRegex.exec(text))) {
                                const start = from + match.index;
                                const end = start + match[0].length;
                                const isCode = isInCodeBlock(view.state, start);
                                if (!isCode) {
                                    const mentionText = match[1] //.slice(1); // Exclude '@'
                                    if (!mentionText || mentionText === "") continue; // Skip empty mentions (e.g. '@')
                                    const detail = getMentionDetail(dotnetHelper, mentionText) // Fetch the detail for the mention
                                    const widget = createMentionWidget(detail);
                                    builder.add(end, end, widget); // Add widget right after the mention
                                }
                            }
                        }
                    }

                    return builder.finish();
                },
            };
        },
        {
            decorations: plugin => plugin.update()
        }
    )
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

function createMentionWidget(detail: string) {
    return Decoration.replace({
        widget: buildWidget({
            eq: () => false,
            toDOM: () => {
                const span = document.createElement("span");
                span.textContent = detail
                span.className = "mention-detail";
                return span;
            },
            ignoreEvent() { return false; }
        }),
        side: 1 // Ensures the widget is placed after the mention
    });
}

function getMentionDetail(dotnetHelper: any, mentionText: string) {
    // Logic to fetch the detail for a given mention
    // This could be a lookup in a local Map, or an asynchronous fetch
    // For demonstration, returning a static string
    //const details: Completion[] = await dotnetHelper.invokeMethodAsync('GetMentionCompletionsFromJS', mentionText)
    //return details && details[0] ? details[0].detail : null;
    const cachedCompletion = cachedCompletions.find(cached => cached.label === mentionText)
    if (cachedCompletion) {
        return cachedCompletion.detail
    }
    else {
        return "details for " + mentionText
    }
}

const cachedCompletions: Completion[] = []

async function getMentionCompletionsFromDotNet(dotnetHelper: any, firstCharacters: string | null): Promise<Completion[]> {
    try {
        const completions = await dotnetHelper.invokeMethodAsync('GetMentionCompletionsFromJS', firstCharacters)
        // if some completions are missing from cachedCompletions, add them
        completions.forEach((completion: Completion) => {
            const cachedCompletion = cachedCompletions.find(cached => cached.label === completion.label)
            if (!cachedCompletion) {
                cachedCompletions.push(completion)
            }
        })
        return completions
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

const mentionDecorationPlugin = ViewPlugin.define(
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
    createMentionDecorationPlugin(true),
    stylingEnabled ? createMentionDetailsPlugin(dotnetHelper) : [],
]
