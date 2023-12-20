import { Command } from "@codemirror/view"
import { Transaction, SelectionRange } from "@codemirror/state"
import { markdownLanguage } from "@codemirror/lang-markdown"
import { toggleCharactersAroundRange } from "./CmFormatting"

const toggleMarkdownBold: Command = ({ state, dispatch }) => {
    const changes = state.changeByRange((range: SelectionRange) => {
        if (!markdownLanguage.isActiveAt(state, range.from)) {
            return { range };
        }
        return toggleCharactersAroundRange("**", state, range);
    })
    dispatch(state.update(changes, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), }))
    return true
}

const toggleMarkdownItalics: Command = ({ state, dispatch }) => {
    const changes = state.changeByRange((range: SelectionRange) => {
        if (!markdownLanguage.isActiveAt(state, range.from)) {
            return { range }
        }
        return toggleCharactersAroundRange("*", state, range)
    })
    dispatch(state.update(changes, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), }))
    return true
}

export const customMarkdownKeymap = [
    { key: 'Mod-b', run: toggleMarkdownBold },    // Cmd/Ctrl + B for bold
    { key: 'Mod-i', run: toggleMarkdownItalics }, // Cmd/Ctrl + I for italics
]
