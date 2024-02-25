import type { EditorState } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import { CMInstances } from './CmInstance'
import { getIdFromState } from './CmId'


const hasOverlap = (x1: number, x2: number, y1: number, y2: number) => {
    return Math.max(x1, y1) <= Math.min(x2, y2)
}

export const isCursorInRange = (state: EditorState, from: number, to: number) => {
    const id = getIdFromState(state)
    if (!CMInstances[id].config?.showMarkdownControlCharactersAroundCursor) return false
    return state.selection.ranges.some((range) => {
        return hasOverlap(from, to, range.from, range.to)
    })
}

export function isInCodeBlock(state: EditorState, pos: number) {
    let tree = syntaxTree(state).resolve(pos, -1)
    while (tree.parent) {
        if (tree.name.indexOf('Code') > -1 || tree.name === 'HTMLTag')
            return true
        tree = tree.parent
    }
    return false
}
