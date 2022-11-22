import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {EditorState, Compartment} from "@codemirror/state"
import {cpp} from "@codemirror/lang-cpp"
import {css} from "@codemirror/lang-css"
import {html} from "@codemirror/lang-html"
import {javascript} from "@codemirror/lang-javascript"
import {json} from "@codemirror/lang-json"
import {markdown} from "@codemirror/lang-markdown"
import {python} from "@codemirror/lang-python"
import {sql} from "@codemirror/lang-sql"
import {xml} from "@codemirror/lang-xml"
import {indentWithTab} from "@codemirror/commands"


var dotNetHelpers: { [id: string]: any } = {}
let language = new Compartment
let tabSize = new Compartment
let state: EditorState
let view: EditorView


export function initCodeMirror(id: string, initialText: string) {
    state = EditorState.create({
        doc: initialText,
        extensions: [
            basicSetup,
            language.of(markdown()),
            tabSize.of(EditorState.tabSize.of(4)),
            keymap.of([indentWithTab]),
            EditorView.updateListener.of(async (update) => {
                if (update.docChanged) {
                    await dotNetHelpers[id].invokeMethodAsync("UpdateText", update.state.doc.toString());
                }
            }),
        ]
    })

    view = new EditorView({
        state,
        parent: document.getElementById(id)
    })
}

export function setTabSize(view: EditorView, size: number) {
    view.dispatch({
        effects: tabSize.reconfigure(EditorState.tabSize.of(size))
    })
}


export function initDotNetHelpers(dotnetHelper: any, id: string)
{
    dotNetHelpers[id] = dotnetHelper
}
