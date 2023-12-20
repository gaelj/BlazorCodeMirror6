import { EditorState, EditorSelection, Text, SelectionRange } from "@codemirror/state";

export function toggleCharactersAroundRange(controlChar: string, state: EditorState, range: SelectionRange) {
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
