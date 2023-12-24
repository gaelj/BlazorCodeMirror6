import { EditorView } from "@codemirror/view"
import { StateEffect, StateField, Transaction, ChangeSpec } from '@codemirror/state'
import * as emoji from 'node-emoji'

type replaceEmojiType = {
    from: number
    to: number
    emoji: string
}

// Define a state effect that represents the emoji replacement
const replaceEmojiEffect = StateEffect.define<replaceEmojiType>()

const emojiTransactionTag = Symbol("emojiTransaction")

/**
 * A state field that keeps track of whether the last operation was an undo
 */
export const lastOperationWasUndo = StateField.define<boolean>({
    create: () => false,
    update: (value, tr) => {
        if (tr.isUserEvent('undo')) {
            return true // Set flag to true if the last operation was an undo
        } else if (value) {
            return false // Reset flag on the next operation
        }
        return value
    }
})

/**
 * A function to replace the last word with an emoji
 * @param tr
 * @returns
 */
function checkForEmojiReplacement(tr: Transaction): StateEffect<replaceEmojiType> | null {
    if (tr.changes.empty) return null

    let lastChange = { from: 0, to: 0, inserted: "" }
    tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
        lastChange = { from: fromA, to: toB, inserted: inserted.toString() }
    })

    const { from, to, inserted } = lastChange

    // if the emoji map has a key that matches inserted text, just insert the emoji
    if (inserted.length > 1) {
        // if inserted begins and ends with a semicolon only
        if (inserted.match(/^(:.*:)$/)) {
            const insertedEmoji = emoji.get(inserted)
            if (insertedEmoji) {
                return replaceEmojiEffect.of({ from: from, to: to, emoji: insertedEmoji })
            }
        }
    }

    if (inserted.length === 1) {
        const line = tr.state.doc.lineAt(from)
        const beforeText = line.text.slice(0, from - line.from)
        const potentialEmojiText = beforeText + inserted
        const match = potentialEmojiText.match(/(:.*:)$/) // Get the emoji code in the last word
        if (match) {
            const match0 = match[0].trim()
            const lastWordEmoji = emoji.get(match0)
            if (lastWordEmoji) {
                return replaceEmojiEffect.of({ from: from + 1 - match0.length, to: to, emoji: lastWordEmoji })
            }
        }
    }

    return null
}

/**
 * An extension that replaces the last word with an emoji, if it's an :emoji_code:
 */
export function createEmojiExtension(enabled: boolean) {
    return EditorView.updateListener.of(
        update => {
            if (enabled === false) return // Skip emoji replacement if disabled
            if (update.state.field(lastOperationWasUndo)) {
                return // Skip emoji replacement if last operation was an undo
            }

            const specs: ChangeSpec[] = []
            for (const tr of update.transactions) {
                if (!tr.docChanged) continue;
                const emojiEffect: StateEffect<replaceEmojiType> = checkForEmojiReplacement(tr);
                if (emojiEffect) {
                    const { from, to, emoji } = emojiEffect.value;
                    specs.push({ from: from, to: to, insert: emoji })
                }
            }
            if (specs.length > 0)
                update.view.dispatch({
                    changes: specs,
                    annotations: Transaction.userEvent.of(emojiTransactionTag.toString())
                })
        }
    )
}
