import { toggleMarkdownBold, toggleMarkdownItalic } from "./CmCommands"
import { KeyBinding } from '@codemirror/view'

export const customMarkdownKeymap: KeyBinding[] = [
    { key: 'Mod-b', run: toggleMarkdownBold },    // Cmd/Ctrl + B for bold
    { key: 'Mod-i', run: toggleMarkdownItalic },  // Cmd/Ctrl + I for italics
]
