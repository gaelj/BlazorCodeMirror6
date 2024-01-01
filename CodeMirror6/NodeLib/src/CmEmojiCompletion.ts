import { Completion, CompletionContext, CompletionSource } from "@codemirror/autocomplete"
import { isInCodeBlock } from "./CmHelpers"
import * as emoji from 'node-emoji'
import emojilib from 'emojilib'


export const emojiCompletions: Completion[] = []

// make a completion for each emoji in emojilib
Object.keys(emojilib).forEach(emojiChar => {
    let mdEmojiCode = emoji.which(emojiChar, {markdown: true})
    if (mdEmojiCode) {
        mdEmojiCode = mdEmojiCode.slice(1, -1)
        emojiCompletions.push({
            label: `${mdEmojiCode}: `,
            detail: emojiChar,
        })
    }
})

function createEmojiCompletionSource(): CompletionSource {
    return async (context: CompletionContext) => {
        let options: Completion[] = []
        let from = context.pos

        const isCode = isInCodeBlock(context.state, from)

        if (!isCode) {
            const match = context.matchBefore(/(?:\s|^)\:[\w]*$/)
            if (match) {
                const searchText = context.matchBefore(/[\w]+/)
                if (searchText)
                    from = searchText.from
                options = getEmojiCompletions(searchText ? searchText.text : null)
            }
        }

        return {
            from: from,
            options: options,
            validFor: /^[\w]*$/,
        }
    }
}

function getEmojiCompletions(firstCharacters: string | null): Completion[] {
    try {

        return emojiCompletions.filter(cached => !firstCharacters ||
            cached.label.indexOf(firstCharacters) > -1 ||
            cached.detail.indexOf(firstCharacters) > -1
            )
    } catch (error) {
        console.error('Error fetching emoji completions:', error)
        return []
    }
}

export const emojiCompletionExtension = (enabled: boolean) => {
    if (!enabled) return []
    return [createEmojiCompletionSource()]
}
