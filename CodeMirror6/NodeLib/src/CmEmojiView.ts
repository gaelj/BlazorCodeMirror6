import { syntaxTree } from '@codemirror/language'
import { RangeSet, StateField } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'
import type { EditorState, Extension, Range } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { buildWidget } from './lib/codemirror-kit'
import { isCursorInRange } from './CmHorizontalRule'
import * as emoji from 'node-emoji'

const emojiRegex = /(:.*:)/

const emojiWidget = (emoji: string) => buildWidget({
    eq: () => false,
    toDOM: () => {
        const span = document.createElement('span');
        //TODO: show emoji
        span.innerText = emoji
        return span;
    },
})

/**
 * Return the horizontal rule Extension if the supplied parameter is true
 * @param enabled
 * @returns
 */
export const viewEmojiExtension = (enabled: boolean = true): Extension => {
    if (!enabled)
        return []

    const emojiDecoration = (emoji: string) => Decoration.replace({
        widget: emojiWidget(emoji),
    })

    const decorate = (state: EditorState) => {
        const widgets: Range<Decoration>[] = [];

        if (enabled) {
            syntaxTree(state).iterate({
                enter: ({ type, from, to }) => {
                    if (!isCursorInRange(state, from, to)) {
                        const line = state.doc.lineAt(from)
                        const lineText = state.doc.sliceString(line.from, line.to)

                        const matches = emojiRegex.exec(lineText)
                        if (!matches) return
                        for (let emojiCode of matches.values()) {
                            const insertedEmoji = emoji.get(emojiCode)
                            if (!insertedEmoji) continue
                            widgets.push(emojiDecoration(insertedEmoji).range(line.from, line.to))
                        }
                    }
                },
            })
        }

        return widgets.length > 0 ? RangeSet.of(widgets) : Decoration.none;
    }

    const viewPlugin = ViewPlugin.define(() => ({}), {})
    const stateField = StateField.define<DecorationSet>({
        create(state) {
            return decorate(state)
        },
        update(_references, { state }) {
            return decorate(state)
        },
        provide(field) {
            return EditorView.decorations.from(field)
        },
    })

    return [
        viewPlugin,
        stateField,
    ]
}
