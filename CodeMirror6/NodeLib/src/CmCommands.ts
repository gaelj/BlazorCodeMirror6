import { markdownLanguage } from "@codemirror/lang-markdown"
import { syntaxTree } from "@codemirror/language"
import { SyntaxNodeRef } from "@lezer/common"
import { ViewUpdate } from "@codemirror/view"
import { EditorState, ChangeSpec, EditorSelection, Transaction, Text, SelectionRange } from "@codemirror/state"
import { Command } from "@codemirror/view"
import { EditorView } from "codemirror"

/**
 * Return the active Markdown styles in the selection
 * @param update
 * @returns
 */
export function getMarkdownStyleAtRange(update: ViewUpdate): string[] {
    let styles: string[] = [];
    for (let range of update.state.selection.ranges) {
        let tree = syntaxTree(update.state)
        tree.iterate({
            from: range.from,
            to: range.to,
            enter: (node: SyntaxNodeRef) => {
                const style = node.name
                if (style && !styles.includes(style)) {
                    styles.push(style)
                }
            }
        })
    }
    console.log("Active Markdown styles in selection:", styles)
    return styles
}

function toggleCharactersAroundRange(controlChar: string, state: EditorState, range: SelectionRange) {
    const controlCharLength = controlChar.length
    const lineWithRangeFrom = state.doc.lineAt(range.from)
    const lineWithRangeTo = state.doc.lineAt(range.to)
    const fromWithChars = Math.max(range.from - controlCharLength, lineWithRangeFrom.from);
    const toWithChars = Math.min(range.to + controlCharLength, lineWithRangeTo.to)
    const isStyledBefore = state.sliceDoc(fromWithChars, range.from) === controlChar
    const isStyledAfter = state.sliceDoc(range.to, toWithChars) === controlChar
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

    const extendBefore = isStyledBefore ? -controlCharLength : controlCharLength
    const extendAfter = isStyledAfter ? -controlCharLength : controlCharLength

    const newLineWithRangeFrom = state.doc.lineAt(range.from)
    const newLineWithRangeTo = state.doc.lineAt(range.to)
    const extendedFrom = Math.max(range.from, newLineWithRangeFrom.from) + extendBefore
    const extendedTo = Math.min(range.to, newLineWithRangeTo.to) + extendAfter

    return {
        changes,
        range: EditorSelection.range(extendedFrom, extendedTo),
    }
}

function toggleCharactersAroundRanges(view: EditorView, controlChar: string): boolean {
    const changes = view.state.changeByRange((range: SelectionRange) => {
        if (!markdownLanguage.isActiveAt(view.state, range.from)) return { range }
        return toggleCharactersAroundRange(controlChar, view.state, range)
    })
    view.dispatch(view.state.update(changes, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), }))
    view.focus()
    return true
}

function toggleCharactersAtStartOfLines(view: EditorView, controlChar: string, exactMatch: boolean): boolean {
    const changes = view.state.changeByRange((range: SelectionRange) => {
        if (!markdownLanguage.isActiveAt(view.state, range.from)) return { range }
        const fullControlChar = `${controlChar} `
        const lineAtFrom = view.state.doc.lineAt(range.from)
        const lineAtTo = view.state.doc.lineAt(range.to)
        const wasStyled = lineAtFrom.text.trimStart().startsWith(exactMatch ? `${controlChar} ` : controlChar[0]);
        const changes = [];
        const indexOfSpace = exactMatch ? fullControlChar.length : lineAtFrom.text.indexOf(' ') + 1
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

        const newLineAtFrom = view.state.doc.lineAt(range.from)
        const newLineAtTo = view.state.doc.lineAt(range.to)
        if (newFrom < newLineAtFrom.from) newFrom = newLineAtFrom.from
        if (newTo < newLineAtFrom.from) newTo = newLineAtFrom.from
        if (newFrom > newLineAtTo.to) newFrom = newLineAtTo.to

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
export const toggleMarkdownQuoteCommand: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, ">", true)
export const toggleMarkdownHeading1Command: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, "#", false)
export const toggleMarkdownHeading2Command: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, "##", false)
export const toggleMarkdownHeading3Command: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, "###", false)
export const toggleMarkdownHeading4Command: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, "####", false)
export const toggleMarkdownHeading5Command: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, "#####", false)
export const toggleMarkdownHeading6Command: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, "######", false)
export const toggleMarkdownUnorderedListCommand: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, "-", true)
export const toggleMarkdownOrderedListCommand: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, "1.", true)
export const toggleMarkdownTaskListCommand: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, "- [ ]", true)

export function insertOrReplaceTextCommand(view: EditorView, textToInsert: string) {
    const changeSpec = view.state.changeByRange((range: SelectionRange) => {
        const changes: ChangeSpec[] = []
        if (range.empty) {
            // Range length is 0, so insert
            changes.push({ from: range.from, insert: textToInsert })
        } else {
            // Range length is more than 0, so replace
            changes.push({ from: range.from, to: range.to, insert: textToInsert })
        }
        return {
            changes,
            range: EditorSelection.range(range.from, range.from + textToInsert.length),
        }
    })
    view.dispatch(
        view.state.update(changeSpec, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), })
    )
    view.focus()
}

