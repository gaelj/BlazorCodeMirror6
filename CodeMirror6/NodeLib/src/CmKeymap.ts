import { toggleMarkdownBoldCommand, toggleMarkdownItalicCommand } from "./CmCommands"

export const customMarkdownKeymap = [
    { key: 'Mod-b', run: toggleMarkdownBoldCommand },    // Cmd/Ctrl + B for bold
    { key: 'Mod-i', run: toggleMarkdownItalicCommand }, // Cmd/Ctrl + I for italics
]
