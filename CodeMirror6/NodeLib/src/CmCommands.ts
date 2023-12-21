import { markdownLanguage } from "@codemirror/lang-markdown";
import { Transaction } from "@codemirror/state";
import { EditorState, EditorSelection, Text, SelectionRange } from "@codemirror/state";
import { Command } from "@codemirror/view";

function toggleCharactersAroundRange(controlChar: string, state: EditorState, range: SelectionRange) {
    const controlCharLength = controlChar.length;
    const isStyledBefore = state.sliceDoc(range.from - controlCharLength, range.from) === controlChar;
    const isStyledAfter = state.sliceDoc(range.to, range.to + controlCharLength) === controlChar;
    const changes = []

    changes.push(isStyledBefore ? {
        from: range.from - controlCharLength,
        to: range.from,
        insert: Text.of([''])
    } : {
        from: range.from,
        insert: Text.of([controlChar]),
    })

    changes.push(isStyledAfter ? {
        from: range.to,
        to: range.to + controlCharLength,
        insert: Text.of([''])
    } : {
        from: range.to,
        insert: Text.of([controlChar]),
    })

    const extendBefore = isStyledBefore ? -controlCharLength : controlCharLength;
    const extendAfter = isStyledAfter ? -controlCharLength : controlCharLength;

    return {
        changes,
        range: EditorSelection.range(range.from + extendBefore, range.to + extendAfter),
    }
}

function toggleCharactersAroundRanges(state: EditorState, dispatch: (tr: Transaction) => void, controlChar: string): boolean{
    const changes = state.changeByRange((range: SelectionRange) => {
        if (!markdownLanguage.isActiveAt(state, range.from)) {
            return { range }
        }
        return toggleCharactersAroundRange(controlChar, state, range)
    })
    dispatch(state.update(changes, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), }))
    return true
}

function toggleCharactersAtStartOfLine(state: EditorState, dispatch: (tr: Transaction) => void, controlChar: string): boolean {
    const changes = state.changeByRange((range: SelectionRange) => {
        if (!markdownLanguage.isActiveAt(state, range.from)) {
            return { range }
        }
        const fullControlChar = `${controlChar} `
        const line = state.doc.lineAt(range.from)
        const wasStyled = line.text.trimStart().startsWith(fullControlChar);
        const changes = [];

        changes.push(wasStyled ? {
            from: line.from,
            to: line.from + fullControlChar.length,
            insert: Text.of([''])
        } : {
            from: line.from,
            insert: Text.of([fullControlChar]),
        })

        return {
            changes,
            range: EditorSelection.range(
                range.from + ((wasStyled ? -1 : 1) * fullControlChar.length),
                range.to + ((wasStyled ? -1 : 1) * fullControlChar.length)
            ),
        }
    })
    dispatch(state.update(changes, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), }))
    return true
}

export const toggleMarkdownBoldCommand: Command = ({ state, dispatch }) => toggleCharactersAroundRanges(state, dispatch, "**")
export const toggleMarkdownItalicCommand: Command = ({ state, dispatch }) => toggleCharactersAroundRanges(state, dispatch, "*")
export const toggleMarkdownStrikethroughCommand: Command = ({ state, dispatch }) => toggleCharactersAroundRanges(state, dispatch, "~~")
export const toggleMarkdownCodeCommand: Command = ({ state, dispatch }) => toggleCharactersAroundRanges(state, dispatch, "`")
export const toggleMarkdownCodeBlockCommand: Command = ({ state, dispatch }) => toggleCharactersAroundRanges(state, dispatch, "```")

export const toggleMarkdownQuoteCommand: Command = ({ state, dispatch }) => toggleCharactersAtStartOfLine(state, dispatch, ">")
export const toggleMarkdownHeading1Command: Command = ({ state, dispatch }) => toggleCharactersAtStartOfLine(state, dispatch, "#")
export const toggleMarkdownHeading2Command: Command = ({ state, dispatch }) => toggleCharactersAtStartOfLine(state, dispatch, "##")
export const toggleMarkdownHeading3Command: Command = ({ state, dispatch }) => toggleCharactersAtStartOfLine(state, dispatch, "###")
export const toggleMarkdownHeading4Command: Command = ({ state, dispatch }) => toggleCharactersAtStartOfLine(state, dispatch, "####")
export const toggleMarkdownHeading5Command: Command = ({ state, dispatch }) => toggleCharactersAtStartOfLine(state, dispatch, "#####")
export const toggleMarkdownHeading6Command: Command = ({ state, dispatch }) => toggleCharactersAtStartOfLine(state, dispatch, "######")
export const toggleMarkdownUnorderedListCommand: Command = ({ state, dispatch }) => toggleCharactersAtStartOfLine(state, dispatch, "-")
export const toggleMarkdownOrderedListCommand: Command = ({ state, dispatch }) => toggleCharactersAtStartOfLine(state, dispatch, "1.")
export const toggleMarkdownTaskListCommand: Command = ({ state, dispatch }) => toggleCharactersAtStartOfLine(state, dispatch, "- [ ]")

