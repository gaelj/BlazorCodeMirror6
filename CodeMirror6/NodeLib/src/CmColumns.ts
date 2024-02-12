import { Decoration, ViewPlugin, EditorView, KeyBinding } from "@codemirror/view";
import { Extension, RangeSetBuilder, Transaction } from "@codemirror/state";
import { buildWidget } from "./lib/codemirror-kit";
import { Diagnostic } from "@codemirror/lint";
import { consoleLog } from "./CmLogging";


function createColumnReplaceDecoration(content: string, from: number) {
    return Decoration.widget({
        widget: buildWidget({
            eq: (other) => other.content === content && other.from === from,
            toDOM: (view: EditorView) => {
                const span = document.createElement("span")
                span.setAttribute("aria-hidden", "true")
                span.style.whiteSpace = "pre";
                span.textContent = content;
                span.onclick = () => {
                    view.dispatch(view.state.update({ selection: { anchor: from } }))
                }
                return span
            },
            ignoreEvent: () => false,
            content: content,
            from: from,
        }),
        side: 1,
    })
}

// get next or previous column offset relative to the current position
function getRelativeColumnOffset(text: string, separator: string, position: number, previous: boolean): number {
    let offset = 0
    let inQuotes = false
    let escapeNext = false
    let previousColumnOffset = 0
    for (let i = 0; i < text.length; i++) {
        if (i === position && !previous)
            offset = 0
        else if (i === position && previous)
            return previousColumnOffset - position
        const char = text[i]
        if (escapeNext) {
            offset++
            escapeNext = false
        } else if (char === '"' && i < (text.length - 1) && text[i + 1] === '"') {
            offset++
            escapeNext = true
        } else if (char === '"') {
            inQuotes = !inQuotes
            offset++
        } else if (char === '\\') {
            escapeNext = true
            offset++
        } else if (char === '\n' && previous) {
            previousColumnOffset = offset
            offset++
        } else if (char === '\n' && i >= position) {
            return offset
        } else if (char === separator && !inQuotes && previous) {
            previousColumnOffset = offset
            offset++
        } else if (char === separator && !inQuotes && i >= position) {
            return offset
        } else {
            offset++
        }
    }
    if (previous)
        return previousColumnOffset - position
    else return offset
}

export function columnStylingPlugin(separator: string): Extension {
    return ViewPlugin.define((view: EditorView) => {
        return {
            update: () => {
                const atomicDecoration = Decoration.mark({ atomic: true })
                const maxWidths = findMaxColumnWidthsInCsv(view.state.doc.toString(), separator)
                const builder = new RangeSetBuilder<Decoration>()
                for (const { from, to } of view.visibleRanges) {
                    let pos = from;
                    while (pos < to) {
                        const line = view.state.doc.lineAt(pos)
                        let cell = ""
                        let remaining = line.text
                        let index = 0
                        let cellStartOffset = 0
                        let paddingSize = 0
                        if (remaining !== "") {
                            while (remaining !== null) {
                                [cell, remaining] = extractNextCell(remaining, separator);
                                if (index > 0) {
                                    const padding = " ".repeat(paddingSize)
                                    const widget = createColumnReplaceDecoration(padding, line.from + cellStartOffset - 1)
                                    builder.add(line.from + cellStartOffset - 1, line.from + cellStartOffset - 1, widget)
                                    builder.add(line.from + cellStartOffset - 1, line.from + cellStartOffset, atomicDecoration)
                                }
                                paddingSize = maxWidths[index] - cell.length + 1
                                cellStartOffset += cell.length + 1 // For the cell and the comma
                                index++
                            }
                        }
                        pos = line.to + 1
                    }
                }
                return builder.finish()
            },
        }
    },
    {
        decorations: plugin => plugin.update(),
        eventHandlers: {
            keydown: (e, view) => {
                if (e.ctrlKey === true || e.metaKey === true || e.altKey === true || e.shiftKey === true)
                    return
                if (e.key === "ArrowLeft") {
                    moveCursor(view, -1)
                    e.preventDefault()
                }
                else if (e.key === "ArrowRight") {
                    moveCursor(view, 1)
                    e.preventDefault()
                }
            }
        }
    })
}

export const getColumnStylingKeymap = (separator: string): KeyBinding[] => [
    { key: 'Tab', run: (view) => {
        const offset = getRelativeColumnOffset(view.state.doc.toString(), separator, view.state.selection.main.anchor, false)
        moveCursor(view, offset + 1)
        return true
    }},
    { key: 'Shift-Tab', run: (view) => {
        const offset = getRelativeColumnOffset(view.state.doc.toString(), separator, view.state.selection.main.anchor, true)
        moveCursor(view, offset)
        return true
    }},
]

export function getSeparator(languageName: string) {
    if (languageName === "CSV") return ','
    if (languageName === "TSV") return '\t'
    return null
}

export async function columnLintSource(id: string, view: EditorView, separator: string): Promise<readonly Diagnostic[]> {
    try {
        const code = view.state.doc.toString()
        const data = parseCSV(code, separator)
        const nbCols = data[0].length
        const errors: Diagnostic[] = []
        for (let i = 1; i < data.length; i++) {
            if (data[i].length !== nbCols && data[i].length !== 1) {
                const message = `Expected ${nbCols} columns, found ${data[i].length}`
                const from = view.state.doc.line(i + 1).from
                const to = view.state.doc.line(i + 1).to
                errors.push({ from, to, message, severity: 'error' })
            }
        }
        if (errors.length > 0)
            consoleLog(id, 'Linter found:', errors)
        return errors
    } catch (error) {
        console.error('Linter error:', error)
        return
    }
}

function moveCursor(view: EditorView, inc: number) {
    const { state } = view
    state.selection.main
    const range = state.selection.main
    const newAnchor = Math.max(Math.min(state.doc.length, range.anchor + inc), 0)
    view.dispatch(state.update({
        selection: { anchor: newAnchor },
        scrollIntoView: true,
        userEvent: 'input'
    }))
}


// extract first csv cell from a line of text. Ignore the separator if it is inside quotes. Ignore quotes if they are escaped by another quote. Return the extracted cell and the remaining text after the cell.
function extractNextCell(line: string, separator: string): string[] {
    let cell = ""
    let inQuotes = false
    let escapeNext = false
    let separatorFound = false
    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (escapeNext) {
            cell += char
            escapeNext = false
        } else if (char === '"' && i < (line.length - 1) && line[i + 1] === '"') {
            cell += char
            escapeNext = true
        } else if (char === '"') {
            inQuotes = !inQuotes
            cell += char
        } else if (char === '\\') {
            escapeNext = true
            cell += char
        } else if (char === separator && !inQuotes) {
            separatorFound = true
            break
        } else {
            cell += char
        }
    }
    return [cell, separatorFound === false ? null : line.slice(cell.length + 1)]
}

function extractAllRowCells(line: string, separator: string): string[] {
    let remaining = line
    let cells = []
    while (remaining != null) {
        const [cell, newRemaining] = extractNextCell(remaining, separator)
        cells.push(cell)
        remaining = newRemaining
    }
    return cells
}

function findMaxColumnWidthsInCsv(csvData: string, separator: string): number[] {
    const data = parseCSV(csvData, separator)
    return findMaxColumnWidths(data)
}

function isCsvInvalid(data: string[][]): boolean
{
    return data.some((row) => row.length !== data[0].length)
}

function findMaxColumnWidths(data: string[][]): number[] {
    let maxWidths: number[] = []

    data.forEach(row => {
        row.forEach((cell, index) => {
            const cellWidth = cell.length
            if (!maxWidths[index] || cellWidth > maxWidths[index]) {
                maxWidths[index] = cellWidth
            }
        })
    })

    return maxWidths
}

function parseCSV(csvData: string, separator: string): string[][] {
    return csvData.trim().split('\n').map((row) => extractAllRowCells(row, separator))
}

export function csvToMarkdownTable(text: string, separator: string, withHeaders: boolean)
{
    if (text.indexOf(separator) < 0) return text
    var md = "\n\n"
    const data = parseCSV(text, separator)
    if (isCsvInvalid(data)) return text
    const maxWidths = findMaxColumnWidths(data)
    if (data.length === 0) return text
    if (data.length === 1) withHeaders = false
    if (withHeaders === false) data.unshift(data[0].map(() => ""))
    data.forEach((line, lineIndex) => {
        var mdRow = ""
        line.forEach((cell, cellIndex) => {
            while (cell.indexOf("|") > 0)
                cell = cell.replace("|", "&#124;")
            mdRow += "| " + cell + (' '.repeat(maxWidths[cellIndex] - cell.length)) + " "
        })
        mdRow += "|"
        if (lineIndex === 0) {
            mdRow += "\n"
            line.forEach((cell, cellIndex) => {
                mdRow += "|-" + ('-'.repeat(maxWidths[cellIndex])) + "-"
            });
            mdRow += "|"
        }
        md += mdRow + "\n"
    })
    return md
}
