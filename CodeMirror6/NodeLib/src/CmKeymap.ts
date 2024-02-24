import { toggleMarkdownBold, toggleMarkdownItalic } from "./CmCommands"
import { KeyBinding } from '@codemirror/view';
import { deleteCharBackward, deleteCharForward, deleteGroupBackward, deleteGroupForward } from '@codemirror/commands'

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
