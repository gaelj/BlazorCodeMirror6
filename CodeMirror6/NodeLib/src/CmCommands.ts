import { markdownLanguage } from "@codemirror/lang-markdown"
import { syntaxTree } from "@codemirror/language"
import { SyntaxNodeRef } from "@lezer/common"
import { EditorState, ChangeSpec, EditorSelection, Transaction, Text, SelectionRange, TransactionSpec } from "@codemirror/state"
import { Command } from "@codemirror/view"
import { EditorView } from "codemirror"

import { consoleLog } from "./CmLogging"
import { csvToMarkdownTable } from "./CmColumns"

/**
 * Return the active Markdown styles in the selection
 * @param update
 * @returns
 */
export function getMarkdownStyleAtSelections(id: string, state: EditorState): string[] {
    let styles: string[] = [];
    for (let range of state.selection.ranges) {
        styles.push(...getMarkdownStyleAtRange(id, state, range))
    }
    return styles
}

function getMarkdownStyleAtRange(id: string, state: EditorState, range: SelectionRange): string[] {
    let styles: string[] = [];
    let tree = syntaxTree(state)
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
    consoleLog(id, "Active styles in range:", styles)
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
    return true
}

function toggleCharactersAtStartOfLines(view: EditorView, controlChar: string, exactMatch: boolean): boolean {
    const changes = view.state.changeByRange((range: SelectionRange) => {
        if (!markdownLanguage.isActiveAt(view.state, range.from)) return { range }
        const fullControlChar = `${controlChar} `
        const lineAtFrom = view.state.doc.lineAt(range.from)
        const wasStyled = !exactMatch
            ? lineAtFrom.text.trimStart().startsWith(controlChar[0])
            : controlChar !== "- [ ]"
                ? lineAtFrom.text.trimStart().startsWith(`${controlChar} `)
                : (lineAtFrom.text.trimStart().startsWith(`${controlChar} `) || lineAtFrom.text.trimStart().startsWith("- [x] "));
        const changes = [];
        const indexOfSpace = exactMatch ? fullControlChar.length : lineAtFrom.text.indexOf(' ') + 1
        const oldStyleLength = wasStyled ? indexOfSpace === 0 ? lineAtFrom.text.length : indexOfSpace : 0
        const wasSameStyle = wasStyled && (lineAtFrom.text.trimStart().startsWith(fullControlChar) || (controlChar === "- [ ]" && lineAtFrom.text.trimStart().startsWith("- [x] ")))
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
        if (newFrom < newLineAtFrom.from) newFrom = newLineAtFrom.from
        if (newTo < newLineAtFrom.from) newTo = newLineAtFrom.from

        return {
            changes,
            range: EditorSelection.range(newFrom, newTo),
        }
    })
    view.dispatch(view.state.update(changes, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), }))
    return true
}

function modifyHeaderLevelAtSelections(view: EditorView, delta: number): boolean {
    const changes = view.state.changeByRange((range: SelectionRange) => {
        if (!markdownLanguage.isActiveAt(view.state, range.from)) return { range }
        const lineAtFrom = view.state.doc.lineAt(range.from)
        const headerLevel = lineAtFrom.text.match(/^#+/)?.[0]?.length ?? 0
        const headerLengthWithSpaces = lineAtFrom.text.match(/^#+\s+/)?.[0]?.length ?? 0
        const newHeaderLevel = Math.max(0, Math.min(6, headerLevel + delta))
        if (newHeaderLevel === headerLevel) return { range }
        const changes = []
        if (newHeaderLevel === 0) {
            changes.push({
                from: lineAtFrom.from,
                to: lineAtFrom.from + headerLengthWithSpaces,
                insert: Text.of([''])
            })
        }
        else {
            changes.push({
                from: lineAtFrom.from,
                to: lineAtFrom.from + headerLengthWithSpaces,
                insert: Text.of(['#'.repeat(newHeaderLevel) + ' '])
            })
        }
        let from = Math.min(Math.max(lineAtFrom.from, range.from + delta), lineAtFrom.to)
        if (newHeaderLevel === 0)
            from -= (headerLengthWithSpaces - headerLevel)
        if (headerLevel === 0)
            from += 1
        return {
            changes,
            range: EditorSelection.range(from, from),
        }
    })
    view.dispatch(view.state.update(changes, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), }))
    return true
}

export function insertTableAboveCommand(view: EditorView, x: number, y: number) {
    var header = "| Header ".repeat(x) + "|"
    var sp =     "| ------ ".repeat(x) + "|"
    var row =    "|        ".repeat(x) + "|\n"
    const table = `
${header}
${sp}
${row.repeat(y)}
`
    insertTextAboveCommand(view, table)
}
export function insertHorizontalRuleAboveCommand(view: EditorView) {
    insertTextAboveCommand(view, "\n---\n")
}
export const toggleMarkdownBold: Command = (view: EditorView) => toggleCharactersAroundRanges(view, "**")
export const toggleMarkdownItalic: Command = (view: EditorView) => toggleCharactersAroundRanges(view, "*")
export const toggleMarkdownStrikethrough: Command = (view: EditorView) => toggleCharactersAroundRanges(view, "~~")
export const toggleMarkdownCode: Command = (view: EditorView) => toggleCharactersAroundRanges(view, "`")
export const toggleMarkdownCodeBlock: Command = (view: EditorView) => toggleCharactersAroundRanges(view, "```")
export const toggleMarkdownQuote: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, ">", true)
export function toggleMarkdownHeading(headingLevel: number): Command {
    return (view: EditorView) => toggleCharactersAtStartOfLines(view, "#".repeat(headingLevel), false)
}
export const increaseMarkdownHeadingLevel: Command = (view: EditorView) => {
    return modifyHeaderLevelAtSelections(view, -1);
}
export const decreaseMarkdownHeadingLevel: Command = (view: EditorView) => {
    return modifyHeaderLevelAtSelections(view, 1);
}
export const toggleMarkdownUnorderedList: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, "-", true)
export const toggleMarkdownOrderedList: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, "1.", true)
export const toggleMarkdownTaskList: Command = (view: EditorView) => toggleCharactersAtStartOfLines(view, "- [ ]", true)

export function insertOrReplaceText(view: EditorView, textToInsert: string) {
    const transactionSpec: TransactionSpec = view.state.changeByRange((range: SelectionRange) => {
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
        view.state.update(transactionSpec, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), })
    )
}

export function insertTextAboveCommand(view: EditorView, textToInsert: string) {
    const changeSpec = view.state.changeByRange((range: SelectionRange) => {
        const changes: ChangeSpec[] = []
        // find the beginning of the line
        const lineStart = view.state.doc.lineAt(range.from).from
        // insert the text at the beginning of the line
        changes.push({ from: lineStart, insert: textToInsert + "\n" })
        return {
            changes,
            range: EditorSelection.range(range.from + textToInsert.length, range.from + textToInsert.length),
        }
    })
    view.dispatch(
        view.state.update(changeSpec, { scrollIntoView: true, annotations: Transaction.userEvent.of('input'), })
    )
}

export async function copy(view: EditorView) {
    try {
        const texts = view.state.selection.ranges
            .map(range => view.state.sliceDoc(range.from, range.to))
            .filter(text => text) // remove empty strings
            .map(t => new ClipboardItem({ "text/plain": new Blob([t], { type: "text/plain" }) }))
        await navigator.clipboard.write(texts)
        view.focus()
        return true
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
}

export async function cut(view: EditorView) {
    if (await copy(view)) {
        const changes: ChangeSpec[] = []
        for (const range of view.state.selection.ranges) {
            if (!range.empty) {
                changes.push({ from: range.from, to: range.to, insert: "" })
            }
        }
        if (changes.length > 0) {
            view.dispatch(view.state.update({
                changes: changes,
                scrollIntoView: true,
                userEvent: 'cut',
            }))
        }
    }
}

export async function paste(view: EditorView): Promise<boolean> {
    try {
        let text = await navigator.clipboard.readText()
        text = text.replace(/\r\n/g, '\n')
        /*
        let items = await navigator.clipboard.read()
        const htmlItems = items.filter(item => item.types.includes("text/html"))
        if (htmlItems.length > 0) {
            for (let item of htmlItems) {
                if (item.types.includes("text/html")) {
                    text = await (await item.getType("text/html")).text() + "\n"
                    break
                }
            }
        } */
        const changes: ChangeSpec[] = []
        const newSelectionRanges: SelectionRange[] = []
        let totalTextLength = 0
        for (const range of view.state.selection.ranges) {
            if (markdownLanguage.isActiveAt(view.state, range.from) &&
                markdownLanguage.isActiveAt(view.state, range.to))
                text = csvToMarkdownTable(text, "\t", true)
            changes.push({ from: range.from, to: range.to, insert: text })
            totalTextLength += text.length
            newSelectionRanges.push(EditorSelection.range(range.from + totalTextLength, range.from + totalTextLength))
        }
        view.dispatch(view.state.update({
            changes: changes,
            selection: EditorSelection.create(newSelectionRanges),
            scrollIntoView: true
        }))
        return true
    } catch (err) {
        console.error('Failed to paste text: ', err)
        return false
    }
}
