import { Decoration, ViewPlugin, WidgetType, EditorView, ViewUpdate, DecorationSet } from "@codemirror/view";
import { Extension, RangeSetBuilder } from "@codemirror/state";
import { buildWidget } from "./lib/codemirror-kit";


function createColumnReplaceDecoration(content: string, from: number) {
    return Decoration.replace({
        widget: buildWidget({
            eq: (other) => other.content === content,
            toDOM: (view: EditorView) => {
                const span = document.createElement("span")
                span.style.whiteSpace = "pre";
                span.textContent = content;
                span.onclick = () => {
                    view.dispatch(view.state.update({selection: {anchor: from}}))
                }
                return span
            },
            ignoreEvent: () => true,
            content: content,
        }),
        block: false,
        inclusive: true,
    })
}

export function columnStylingPlugin(separator: string): Extension {
    return ViewPlugin.define((view: EditorView) => {
        return {
            update: () => {
                const maxWidths = findMaxColumnWidthsInCsv(view.state.doc.toString(), separator);
                const builder = new RangeSetBuilder<Decoration>()
                for (const { from, to } of view.visibleRanges) {
                    let pos = from;
                    while (pos < to) {
                        const line = view.state.doc.lineAt(pos);
                        let cell = "";
                        let remaining = line.text;
                        let index = 0;
                        let cellStartOffset = 0;
                        let paddingSize = 0
                        if (remaining !== "") {
                            while (remaining !== null) {
                                [cell, remaining] = extractNextCell(remaining, separator);
                                if (index > 0) {
                                    const padding = " ".repeat(paddingSize) + separator
                                    const widget = createColumnReplaceDecoration(padding, line.from + cellStartOffset - 1)
                                    builder.add(line.from + cellStartOffset - 1, line.from + cellStartOffset, widget);
                                }
                                paddingSize = maxWidths[index] - cell.length + 1;
                                cellStartOffset += cell.length + 1; // For the cell and the comma
                                index++;
                            }
                        }
                        pos = line.to + 1; // Move to the start of the next line
                    }
                }
                return builder.finish();
            },
        }
    },
    {
        decorations: plugin => plugin.update()
    })
}

// extract first csv cell from a line of text. Ignore the separator if it is inside quotes. Ignore quotes if they are escaped by another quote. Return the extracted cell and the remaining text after the cell.
function extractNextCell(line: string, separator: string): string[] {
    let cell = "";
    let inQuotes = false;
    let escapeNext = false;
    let separatorFound = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (escapeNext) {
            cell += char;
            escapeNext = false;
        } else if (char === '"' && i < (line.length - 1) && line[i + 1] === '"') {
            cell += char
            escapeNext = true;
        } else if (char === '"') {
            inQuotes = !inQuotes;
            cell += char;
        } else if (char === '\\') {
            escapeNext = true;
            cell += char;
        } else if (char === separator && !inQuotes) {
            separatorFound = true;
            break;
        } else {
            cell += char;
        }
    }
    return [cell, separatorFound === false ? null : line.slice(cell.length + 1)];
}

function extractAllRowCells(line: string, separator: string): string[] {
    let remaining = line;
    let cells = [];
    while (remaining != null) {
        const [cell, newRemaining] = extractNextCell(remaining, separator);
        cells.push(cell);
        remaining = newRemaining;
    }
    return cells;
}

function findMaxColumnWidthsInCsv(csvData: string, separator: string): number[] {
    const data = parseCSV(csvData, separator);
    return findMaxColumnWidths(data);
}

function findMaxColumnWidths(data: string[][]): number[] {
    let maxWidths: number[] = [];

    data.forEach(row => {
        row.forEach((cell, index) => {
            const cellWidth = cell.length;
            if (!maxWidths[index] || cellWidth > maxWidths[index]) {
                maxWidths[index] = cellWidth;
            }
        });
    });

    return maxWidths;
}

function parseCSV(csvData: string, separator: string): string[][] {
    return csvData.split('\n').map((row) => extractAllRowCells(row, separator));
}
