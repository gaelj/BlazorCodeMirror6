import { Decoration, ViewPlugin, EditorView } from "@codemirror/view";
import { Extension, RangeSetBuilder, Transaction } from "@codemirror/state";
import { buildWidget } from "./lib/codemirror-kit";


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
                                    builder.add(line.from + cellStartOffset - 1, line.from + cellStartOffset - 1, atomicDecoration)
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
                    if (moveCursor(view, 'left'))
                        e.preventDefault()
                }
                else if (e.key === "ArrowRight") {
                    if (moveCursor(view, 'right'))
                        e.preventDefault()
                }
            }
        }
    })
}

function moveCursor(view: EditorView, direction: 'left' | 'right'): boolean {
    console.log("moveCursors")
    const { state } = view
    const transactions: Transaction[] = []
    state.selection.main
    const range = state.selection.main
    const inc = direction === 'right' ? 1 : -1
    const newAnchor = Math.max(Math.min(state.doc.length, range.anchor + inc), 0)
    transactions.push(state.update({
        selection: { anchor: newAnchor },
        scrollIntoView: true,
        userEvent: 'input'
    }))
    if (transactions.length > 0) {
        view.dispatch(...transactions)
        return true
    }
    return false
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
    return csvData.split('\n').map((row) => extractAllRowCells(row, separator))
}
