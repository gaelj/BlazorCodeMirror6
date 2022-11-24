import {basicSetup} from "codemirror"
import {EditorView, keymap, placeholder} from "@codemirror/view"
import {EditorState, Compartment} from "@codemirror/state"
import {cpp} from "@codemirror/lang-cpp"
import {css} from "@codemirror/lang-css"
import {html} from "@codemirror/lang-html"
import {javascript} from "@codemirror/lang-javascript"
import {json} from "@codemirror/lang-json"
import {markdown, markdownLanguage} from "@codemirror/lang-markdown"
import {python} from "@codemirror/lang-python"
import {sql} from "@codemirror/lang-sql"
import {xml} from "@codemirror/lang-xml"
import {indentWithTab} from "@codemirror/commands"
import {languages} from "@codemirror/language-data"
import {autocompletion} from "@codemirror/autocomplete"

let dotNetHelpers: { [id: string]: any } = {}

let lngs: { [id: string]: Compartment } = {}
let tabSizes: { [id: string]: Compartment } = {}

let states: { [id: string]: EditorState } = {}
let views: { [id: string]: EditorView } = {}


export function initCodeMirror(
    dotnetHelper: any,
    id: string,
    initialText: string,
    placeholderText: string,
    tabulationSize: number
) {
    dotNetHelpers[id] = dotnetHelper
    lngs[id] = new Compartment
    tabSizes[id] = new Compartment
    states[id] = EditorState.create({
        doc: initialText,
        extensions: [
            basicSetup,
            lngs[id].of(markdown({ base: markdownLanguage, codeLanguages: languages })),
            tabSizes[id].of(EditorState.tabSize.of(tabulationSize)),
            keymap.of([indentWithTab]),
            EditorView.updateListener.of(async (update) => {
                if (update.docChanged) {
                    await dotNetHelpers[id].invokeMethodAsync("DocChanged", update.state.doc.toString());
                }
                if (update.focusChanged) {
                    await dotNetHelpers[id].invokeMethodAsync("FocusChanged", update.view.hasFocus);
                    if (!update.view.hasFocus)
                        await dotNetHelpers[id].invokeMethodAsync("DocChanged", update.state.doc.toString());
                }
                if (update.selectionSet) {
                    await dotNetHelpers[id].invokeMethodAsync("SelectionSet", update.state.selection.ranges.map(r => {return {from: r.from, to: r.to}}));
                }
            }),
            placeholder(placeholderText),
            autocompletion(),
        ]
    })

    views[id] = new EditorView({
        state: states[id],
        parent: document.getElementById(id),
    })
}

export function setTabSize(id: string,size: number) {
    views[id].dispatch({
        effects: tabSizes[id].reconfigure(EditorState.tabSize.of(size))
    })
}

export function setText(id: string, text: string) {
    const transaction = views[id].state.update({
        changes: {from: 0, to: views[id].state.doc.length, insert: text}
    })
    views[id].dispatch(transaction)
}
