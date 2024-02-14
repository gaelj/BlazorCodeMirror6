import { EditorState, StateField, StateEffect, Extension } from "@codemirror/state";


const idField = StateField.define<string>({
    create() {
        return ""
    },
    update(value, tr) {
        return value;
    }
});

export function createEditorWithId(id: string): Extension {
    return idField.init(() => id)
}

export function getIdFromState(state: EditorState): string {
    return state.field(idField)
}
