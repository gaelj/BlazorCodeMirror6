import { markdownLanguage } from "@codemirror/lang-markdown"
import { syntaxTree } from "@codemirror/language"
import { SyntaxNodeRef } from "@lezer/common"
import { ViewUpdate } from "@codemirror/view"
import { Transaction } from "@codemirror/state"
import { EditorState, EditorSelection, Text, SelectionRange } from "@codemirror/state"
import { Command } from "@codemirror/view"
import { EditorView } from "codemirror"

export function getMarkdownStyleAtRange(update: ViewUpdate): string[] {
    let styles: string[] = [];
    for (let range of update.state.selection.ranges) {
        let tree = syntaxTree(update.state);
        tree.iterate({
            from: range.from,
            to: range.to,
            enter: (node: SyntaxNodeRef) => {
                const style = node.name;
                if (style && !styles.includes(style)) {
                    styles.push(style);
                }
            }
        })
    }
    console.log("Active Markdown styles in selection:", styles)
    return styles
}

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

function toggleCharactersAroundRanges(view: EditorView, controlChar: string): boolean{
    const changes = view.state.changeByRange((range: SelectionRange) => {
        if (!markdownLanguage.isActiveAt(view.state, range.from)) {
            return { range }
        }
        return toggleCharactersAroundRange(controlChar, view.state, range)
    })
    view.dispatch(view.state.update(changes, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), }))
    view.focus()
    return true
}

function toggleCharactersAtStartOfLine(view: EditorView, controlChar: string): boolean {
    const changes = view.state.changeByRange((range: SelectionRange) => {
        if (!markdownLanguage.isActiveAt(view.state, range.from)) {
            return { range }
        }
        const fullControlChar = `${controlChar} `
        const line = view.state.doc.lineAt(range.from)
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
    view.dispatch(view.state.update(changes, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), }))
    view.focus()
    return true
}

export const toggleMarkdownBoldCommand: Command = (view: EditorView) => toggleCharactersAroundRanges(view, "**")
export const toggleMarkdownItalicCommand: Command = (view: EditorView) => toggleCharactersAroundRanges(view, "*")
export const toggleMarkdownStrikethroughCommand: Command = (view: EditorView) => toggleCharactersAroundRanges(view, "~~")
export const toggleMarkdownCodeCommand: Command = (view: EditorView) => toggleCharactersAroundRanges(view, "`")
export const toggleMarkdownCodeBlockCommand: Command = (view: EditorView) => toggleCharactersAroundRanges(view, "```")

export const toggleMarkdownQuoteCommand: Command = (view: EditorView) => toggleCharactersAtStartOfLine(view, ">")
export const toggleMarkdownHeading1Command: Command = (view: EditorView) => toggleCharactersAtStartOfLine(view, "#")
export const toggleMarkdownHeading2Command: Command = (view: EditorView) => toggleCharactersAtStartOfLine(view, "##")
export const toggleMarkdownHeading3Command: Command = (view: EditorView) => toggleCharactersAtStartOfLine(view, "###")
export const toggleMarkdownHeading4Command: Command = (view: EditorView) => toggleCharactersAtStartOfLine(view, "####")
export const toggleMarkdownHeading5Command: Command = (view: EditorView) => toggleCharactersAtStartOfLine(view, "#####")
export const toggleMarkdownHeading6Command: Command = (view: EditorView) => toggleCharactersAtStartOfLine(view, "######")
export const toggleMarkdownUnorderedListCommand: Command = (view: EditorView) => toggleCharactersAtStartOfLine(view, "-")
export const toggleMarkdownOrderedListCommand: Command = (view: EditorView) => toggleCharactersAtStartOfLine(view, "1.")
export const toggleMarkdownTaskListCommand: Command = (view: EditorView) => toggleCharactersAtStartOfLine(view, "- [ ]")

