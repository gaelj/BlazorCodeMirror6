import { markdownLanguage } from "@codemirror/lang-markdown";
import { Transaction } from "@codemirror/state";
import { EditorState, EditorSelection, Text, SelectionRange } from "@codemirror/state";
import { Command } from "@codemirror/view";

function toggleCharactersAroundRange(controlChar: string, state: EditorState, range: SelectionRange) {
    const controlCharLength = controlChar.length;
    const isStyledBefore = state.sliceDoc(range.from - controlCharLength, range.from) === controlChar;
    const isStyledAfter = state.sliceDoc(range.to, range.to + controlCharLength) === controlChar;
    const changes = [];

    changes.push(isStyledBefore ? {
        from: range.from - controlCharLength,
        to: range.from,
        insert: Text.of([''])
    } : {
        from: range.from,
        insert: Text.of([controlChar]),
    });

    changes.push(isStyledAfter ? {
        from: range.to,
        to: range.to + controlCharLength,
        insert: Text.of([''])
    } : {
        from: range.to,
        insert: Text.of([controlChar]),
    });

    const extendBefore = isStyledBefore ? -controlCharLength : controlCharLength;
    const extendAfter = isStyledAfter ? -controlCharLength : controlCharLength;

    return {
        changes,
        range: EditorSelection.range(range.from + extendBefore, range.to + extendAfter),
    };
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

export const toggleMarkdownBoldCommand: Command = ({ state, dispatch }) => toggleCharactersAroundRanges(state, dispatch, "**")
export const toggleMarkdownItalicCommand: Command = ({ state, dispatch }) => toggleCharactersAroundRanges(state, dispatch, "*")
export const toggleMarkdownStrikethroughCommand: Command = ({ state, dispatch }) => toggleCharactersAroundRanges(state, dispatch, "~~")
export const toggleMarkdownCodeCommand: Command = ({ state, dispatch }) => toggleCharactersAroundRanges(state, dispatch, "`")
export const toggleMarkdownCodeBlockCommand: Command = ({ state, dispatch }) => toggleCharactersAroundRanges(state, dispatch, "```")
