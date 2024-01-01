import { Completion, CompletionContext, CompletionSource } from "@codemirror/autocomplete"
import { isInCodeBlock } from "./CmHelpers"


export const cachedCompletions: Completion[] = []

function createMentionsCompletionSource(): CompletionSource {
    return async (context: CompletionContext) => {
        let options: Completion[] = []
        let from = context.pos

        const isCode = isInCodeBlock(context.state, from)

        if (!isCode) {
            const match = context.matchBefore(/(?:\s|^)\@[\w]*$/)
            if (match) {
                const searchText = context.matchBefore(/[\w]+/)
                if (searchText)
                    from = searchText.from
                options = getMentionCompletions(searchText ? searchText.text : null)
            }
        }

        return {
            from: from,
            options: options,
            validFor: /^[\w]*$/,
        }
    }
}

function getMentionCompletions(firstCharacters: string | null): Completion[] {
    try {
        return cachedCompletions.filter(cached => !firstCharacters ||
            cached.label.startsWith(firstCharacters) ||
            cached.detail.startsWith(firstCharacters) ||
            cached.detail.indexOf(` ${firstCharacters}`) > -1
            )
    } catch (error) {
        console.error('Error fetching mention completions:', error)
        return []
    }
}

export function setCachedCompletions(completions: Completion[]) {
    if (cachedCompletions.length === 0) {
        completions.forEach(completion => {
            cachedCompletions.push(completion)
        })
    }
}

export const mentionCompletionExtension = (enabled: boolean) => {
    if (!enabled) return []
    return [createMentionsCompletionSource()]
}
