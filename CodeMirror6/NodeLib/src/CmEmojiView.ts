import { syntaxTree } from '@codemirror/language'
import { RangeSet, StateField } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'
import type { EditorState, Extension, Range } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { buildWidget } from './lib/codemirror-kit'
import { isCursorInRange } from './CmHelpers'
import * as emoji from 'node-emoji'

const emojiWidget = (emoji: string) => buildWidget({
    eq: () => false,
    toDOM: () => {
        const span = document.createElement('span');
        span.textContent = emoji
        return span;
    },
})

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
                        if (type.name === 'Emoji') {
                            const emojiCode = state.sliceDoc(from, to)
                            const emojiText = emoji.get(emojiCode)
                            if (emojiText) {
                                widgets.push(emojiDecoration(emojiText).range(from, to))
                            }
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
