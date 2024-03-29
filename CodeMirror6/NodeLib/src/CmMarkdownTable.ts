import { syntaxTree } from '@codemirror/language'
import { RangeSet, StateField } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'
import type { EditorState, Extension, Range } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { buildWidget } from './lib/codemirror-kit'
import { isCursorInRange } from './CmHelpers'

function markdownTableToHTML(markdownTable: string): string {
    const rows = markdownTable.trim().split(/\r?\n/);
    let htmlTable = "";

    rows.forEach((row, index) => {
        const isHeader = index === 0
        const tag = isHeader ? "th" : "td"
        const cells = row.trim().replace(/^\|/, '').replace(/\|$/, '').trim().split('|').map(cell => cell.trim())
        if (cells.join('').trim().replace(/-/g, '') !== '')
            htmlTable += `  <tr>${cells.map(cell => `<${tag}>${cell}</${tag}>`).join('')}</tr>\n`
    })

    return htmlTable;
}

const tableWidget = (innerHTML: string, from: number) => buildWidget({
    eq: () => {
        return false
    },
    toDOM: (view: EditorView) => {
        const table = document.createElement('table')
        const tbody = document.createElement('tbody')
        table.appendChild(tbody)
        tbody.innerHTML = innerHTML

        if (from !== null) {
            table.style.cursor = 'pointer'
            table.title = 'Click to edit table'
            table.onclick = () => {
                table.style.cursor = 'default'
                table.title = ''
                const pos = from
                const transaction = view.state.update({selection: {anchor: pos}})
                view.dispatch(transaction)
            }
        }
        return table
    },
})

export const markdownTableExtension = (enabled: boolean = true): Extension => {
    const tableDecoration = (innerHTML: string, from: number) => Decoration.replace({
        widget: tableWidget(innerHTML, from),
    })

    const decorate = (state: EditorState) => {
        if (!enabled) {
            // If the extension is disabled, return an empty extension
            return Decoration.none
        }

        const widgets: Range<Decoration>[] = []

        syntaxTree(state).iterate({
            enter: ({ type, from, to }) => {
                if (type.name === 'Table' && !isCursorInRange(state, from, to)) {
                    const tableMarkdown = state.sliceDoc(from, to)
                    const tableHtml = markdownTableToHTML(tableMarkdown)
                    widgets.push(tableDecoration(tableHtml, from).range(from, to))
                }
            },
        })

        return widgets.length > 0 ? RangeSet.of(widgets) : Decoration.none
    }

    const viewPlugin = ViewPlugin.define(() => ({}), {})
    const stateField = StateField.define<DecorationSet>({
        create(state) {
            return decorate(state)
        },
        update(_references, { state }) {
            return decorate(state)
        },
        provide(field) {
            return EditorView.decorations.from(field)
        },
    })

    return [
        viewPlugin,
        stateField,
    ]
}
