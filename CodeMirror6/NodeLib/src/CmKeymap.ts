import { toggleMarkdownBold, toggleMarkdownItalic } from "./CmCommands"

export const customMarkdownKeymap = [
    { key: 'Mod-b', run: toggleMarkdownBold },    // Cmd/Ctrl + B for bold
    { key: 'Mod-i', run: toggleMarkdownItalic }, // Cmd/Ctrl + I for italics
]
