import { Completion, CompletionContext, CompletionSource } from "@codemirror/autocomplete"
import { isInCodeBlock } from "./CmHelpers"


export const cachedCompletions: Completion[] = []

function createMentionsCompletionSource(): CompletionSource {
    return async (context: CompletionContext) => {
        let options: Completion[] = []
        let from = context.pos
        let to = context.pos

        const isCode = isInCodeBlock(context.state, from)

        if (!isCode) {
            const match = context.matchBefore(/(?:\s|^)\@[\w]*$/)
            if (match) {
                const searchText = context.matchBefore(/[\w]+/)
                if (searchText) {
                    from = searchText.from
                    to = searchText.to
                }
                options = getMentionCompletions(searchText ? searchText.text : null)
            }
        }

        return {
            from: from,
            to: to,
            options: options,
            filter: false,
        }
    }
}

function getMentionCompletions(firstCharacters: string | null): Completion[] {
    try {
        console.log(cachedCompletions.filter(cached => !firstCharacters ||
            cached.label.toLowerCase().replace(/\s/g, '').startsWith(firstCharacters.toLowerCase()) ||
            cached.detail.toLowerCase().replace(/\s/g, '').indexOf(firstCharacters.toLowerCase()) > -1 ||
            (cached.info as string).toLowerCase().replace(/\s/g, '').indexOf(firstCharacters.toLowerCase()) > -1
            ).length)
        return cachedCompletions.filter(cached => !firstCharacters ||
            cached.label.toLowerCase().replace(/\s/g, '').startsWith(firstCharacters.toLowerCase()) ||
            cached.detail.toLowerCase().replace(/\s/g, '').indexOf(firstCharacters.toLowerCase()) > -1 ||
            (cached.info as string).toLowerCase().replace(/\s/g, '').indexOf(firstCharacters.toLowerCase()) > -1
            )
    } catch (error) {
        console.error('Error fetching mention completions:', error)
        return []
    }
}

export function setCachedCompletions(completions: Completion[]) {
    if (cachedCompletions.length === 0) {
        cachedCompletions.push(...completions)
    }
}

export const mentionCompletionExtension = (enabled: boolean) => {
    if (!enabled) return []
    return [createMentionsCompletionSource()]
}
