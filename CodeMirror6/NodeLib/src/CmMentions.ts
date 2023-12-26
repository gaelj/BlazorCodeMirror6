import { autocompletion, Completion, CompletionContext, CompletionSource } from "@codemirror/autocomplete"
import { RangeSetBuilder } from '@codemirror/state'
import { EditorView, ViewPlugin, Decoration } from "@codemirror/view"


function createMentionsCompletionSource(dotnetHelper: any): CompletionSource {
    return async (context: CompletionContext) => {
        let options: Completion[] = [];
        if (context.matchBefore(/(?:\s|^)@/)) {
            options = await getMentionCompletionsFromDotNet(dotnetHelper, null);
        }
        else if (context.matchBefore(/(?:\s|^)@(\w+)/)) {
            const mentionsRegex = /(?:\s|^)(?:@)(\w*)/;
            const match = context.matchBefore(mentionsRegex);
            const matchText = match ? match.text : null;
            const matchSearchText = mentionsRegex.exec(matchText);
            const searchText = matchSearchText ? matchSearchText[1] : null;
            options = await getMentionCompletionsFromDotNet(dotnetHelper, searchText);
        }
        return {
            from: context.pos,
            options: options,
            validFor: /^[\w@]*$/,
        };
    };
}

async function getMentionCompletionsFromDotNet(dotnetHelper: any, firstCharacters: string | null): Promise<Completion[]> {
    try {
        console.log('First Characters:', firstCharacters);
        return await dotnetHelper.invokeMethodAsync('GetMentionCompletionsFromJS', firstCharacters);
    } catch (error) {
        console.error('Error fetching mention completions:', error);
        return [];
    }
}

export function createMentionsCompletionExtension(dotnetHelper: any) {
    const mentionsCompletionSource = createMentionsCompletionSource(dotnetHelper);
    return autocompletion({
        override: [mentionsCompletionSource]
    });
}

const mentionRegex = /(?:\s|^)@\w+/g;
const mentionDecorationPlugin = ViewPlugin.define((view: EditorView) => {
    return {
        update: () => {
            const builder = new RangeSetBuilder<Decoration>()

            for (const { from, to } of view.visibleRanges) {
                if (markdownLanguage.isActiveAt(view.state, from)) {
                    const text = view.state.doc.sliceString(from, to);
                    let match;
                    while ((match = mentionRegex.exec(text))) {
                        const start = from + match.index;
                        const end = start + match[0].length;
                        const text2 = view.state.doc.sliceString(start, end);
                        console.log(text2)
                        const isCode = isInCodeBlock(view.state, start)
                        if (!isCode) {
                            builder.add(start, end, Decoration.mark({ class: "mention" }));
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

// Combine the extension with the mention plugin
export const mentionExtension = (dotnetHelper: any) => [
    createMentionsCompletionExtension(dotnetHelper),
    mentionDecorationPlugin
];
