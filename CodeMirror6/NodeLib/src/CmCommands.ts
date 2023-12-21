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
    const lineWithRangeFrom = state.doc.lineAt(range.from);
    const lineWithRangeTo = state.doc.lineAt(range.to);
    const fromWithChars = range.from - controlCharLength < lineWithRangeFrom.from ? lineWithRangeFrom.from : range.from - controlCharLength;
    const toWithChars = range.to + controlCharLength > lineWithRangeTo.to ? lineWithRangeTo.to : range.to + controlCharLength;
    const isStyledBefore = state.sliceDoc(fromWithChars, range.from) === controlChar;
    const isStyledAfter = state.sliceDoc(range.to, toWithChars) === controlChar;
    const changes = []

    changes.push(isStyledBefore ? {
        from: fromWithChars,
        to: range.from,
        insert: Text.of([''])
    } : {
        from: range.from,
        insert: Text.of([controlChar]),
    })

    changes.push(isStyledAfter ? {
        from: range.to,
        to: toWithChars,
        insert: Text.of([''])
    } : {
        from: range.to,
        insert: Text.of([controlChar]),
    })

    const extendBefore = isStyledBefore ? -controlCharLength : controlCharLength;
    const extendAfter = isStyledAfter ? -controlCharLength : controlCharLength;

    const extendedFrom = range.from + extendBefore < lineWithRangeFrom.from ? lineWithRangeFrom.from : range.from + extendBefore
    const extendedTo = range.to + extendAfter > lineWithRangeTo.to ? lineWithRangeTo.to : range.to + extendAfter

    return {
        changes,
        range: EditorSelection.range(extendedFrom, extendedTo),
    }
}

function toggleCharactersAroundRanges(view: EditorView, controlChar: string): boolean{
    const changes = view.state.changeByRange((range: SelectionRange) => {
        if (!markdownLanguage.isActiveAt(view.state, range.from)) return { range }
        return toggleCharactersAroundRange(controlChar, view.state, range)
    })
    view.dispatch(view.state.update(changes, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), }))
    view.focus()
    return true
}

function toggleCharactersAtStartOfLines(view: EditorView, controlChar: string): boolean {
    const changes = view.state.changeByRange((range: SelectionRange) => {
        if (!markdownLanguage.isActiveAt(view.state, range.from)) return { range }
        const fullControlChar = `${controlChar} `
        const lineAtFrom = view.state.doc.lineAt(range.from)
        const lineAtTo = view.state.doc.lineAt(range.to)
        const wasStyled = lineAtFrom.text.trimStart().startsWith(controlChar[0]);
        const changes = [];
        const indexOfSpace = lineAtFrom.text.indexOf(' ') + 1
        const oldStyleLength = wasStyled ? indexOfSpace === 0 ? lineAtFrom.text.length : indexOfSpace : 0
        const wasSameStyle = wasStyled && lineAtFrom.text.trimStart().startsWith(fullControlChar)
        let newFrom = range.from
        let newTo = range.to

        if (wasSameStyle) {
            changes.push({
                from: lineAtFrom.from,
                to: lineAtFrom.from + oldStyleLength,
                insert: Text.of([''])
            })
            newFrom -= oldStyleLength
            newTo -= oldStyleLength
        }
        else {
            if (wasStyled) {
                changes.push({
                    from: lineAtFrom.from,
                    to: lineAtFrom.from + oldStyleLength,
                    insert: Text.of([''])
                })
                newFrom -= oldStyleLength
                newTo -= oldStyleLength
            }
            changes.push({
                from: lineAtFrom.from,
                insert: Text.of([fullControlChar]),
            })
            newFrom += fullControlChar.length
            newTo += fullControlChar.length
        }

        if (newFrom < lineAtFrom.from) newFrom = lineAtFrom.from
        if (newTo < lineAtFrom.from) newTo = lineAtFrom.from
        if (newFrom > lineAtTo.to) newFrom = lineAtTo.to
        if (newTo > lineAtTo.to) newTo = lineAtTo.to

        return {
            changes,
            range: EditorSelection.range(newFrom, newTo),
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

