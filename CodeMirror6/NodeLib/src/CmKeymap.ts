import { toggleMarkdownBold, toggleMarkdownItalic } from "./CmCommands"
import { KeyBinding, EditorView } from '@codemirror/view'
import { Extension, RangeSetBuilder, Transaction, EditorSelection, SelectionRange, Text } from "@codemirror/state"
import {
    deleteCharBackward, deleteCharForward, deleteGroupBackward, deleteGroupForward,
    cursorGroupLeft, cursorGroupRight, selectGroupLeft, selectGroupRight,
    cursorCharLeft, cursorCharRight, selectCharLeft, selectCharRight,
} from '@codemirror/commands'

export const customMarkdownKeymap: KeyBinding[] = [
    { key: 'Mod-b', run: toggleMarkdownBold },    // Cmd/Ctrl + B for bold
    { key: 'Mod-i', run: toggleMarkdownItalic },  // Cmd/Ctrl + I for italics
]

export const customDeleteKeymap = [
    { key: "Delete", run: deleteCharForward },
    { key: "Backspace", run: deleteCharBackward },
    { key: "Mod-Delete", run: deleteGroupForward },
    { key: "Mod-Backspace", run: deleteGroupBackward },
]

export const customArrowKeymap: KeyBinding[] = [
    {
        key: "ArrowLeft",
        run: (view) => moveCursorsByCharacter(view, true, false),
        shift: (view) => moveCursorsByCharacter(view, true, true),
    },
    {
        key: "ArrowRight",
        run: (view) => moveCursorsByCharacter(view, false, false),
        shift: (view) => moveCursorsByCharacter(view, false, true),
    },
    {
        key: "Mod-ArrowLeft",
        run: (view) => moveCursorsByWord(view, true, false),
        shift: (view) => moveCursorsByWord(view, true, true),
    },
    {
        key: "Mod-ArrowRight",
        run: (view) => moveCursorsByWord(view, false, false),
        shift: (view) => moveCursorsByWord(view, false, true),
    },
]

function moveCursorsByCharacter(view: EditorView, previous: boolean, headOnly: boolean) {
    const { state } = view
    const newSelectionRanges: SelectionRange[] = []
    for (const range of state.selection.ranges) {
        const offset = previous ? -1 : 1
        const newAnchor = headOnly ? range.anchor : Math.max(Math.min(state.doc.length, range.head + offset), 0)
        const newHead = !headOnly ? newAnchor : Math.max(Math.min(state.doc.length, range.head + offset), 0)
        newSelectionRanges.push(EditorSelection.range(newAnchor, newHead))
    }
    view.dispatch(state.update({
        selection: EditorSelection.create(newSelectionRanges),
        scrollIntoView: true,
        userEvent: 'input'
    }))
    return true
}

function moveCursorsByWord(view: EditorView, previous: boolean, headOnly: boolean): boolean {
    const { state } = view
    const newSelectionRanges: SelectionRange[] = []

    for (const range of state.selection.ranges) {
        const currentPos = range.head
        const wordBoundary = findWordBoundary(state.doc, currentPos, previous, true)

        const newAnchor = headOnly ? range.anchor : wordBoundary
        const newHead = !headOnly ? newAnchor : wordBoundary

        newSelectionRanges.push(EditorSelection.range(newAnchor, newHead))
    }
    view.dispatch(state.update({
        selection: EditorSelection.create(newSelectionRanges),
        scrollIntoView: true,
        userEvent: 'input'
    }))
    return true
}

function findWordBoundary(doc: Text, pos: number, previous: boolean, firstRun: boolean): number {
    if (previous && pos === 0) return 0
    if (!previous && pos === doc.length) return doc.length
    if (isWordBoundary(doc, pos) && firstRun) {
        pos += previous ? -1 : 1
        return findWordBoundary(doc, pos, previous, false)
    }
    for (let i = pos; previous ? i >= 0 : i < doc.length; i += (previous ? -1 : 1)) {
        if (isWordBoundary(doc, i)) {
            return i
        }
    }
    return previous ? 0 : doc.length
}

function isWordBoundary(doc: Text, pos: number): boolean {
    if (pos < 0 || pos >= doc.length) return true
    const charBefore = doc.sliceString(pos - 1, pos)
    const charAfter = doc.sliceString(pos, pos + 1)
    return /\s/.test(charBefore) !== /\s/.test(charAfter)
}
