import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {EditorState, Compartment} from "@codemirror/state"
import {markdown} from "@codemirror/lang-markdown"
import {indentWithTab} from "@codemirror/commands"


let language = new Compartment
let tabSize = new Compartment

let state: EditorState
let view: EditorView

function setTabSize(view: EditorView, size: number) {
    view.dispatch({
        effects: tabSize.reconfigure(EditorState.tabSize.of(size))
    })
}

export function initCodeMirror(id: string) {
    state = EditorState.create({
        extensions: [
            basicSetup,
            language.of(markdown()),
            tabSize.of(EditorState.tabSize.of(4)),
            keymap.of([indentWithTab]),
        ]
    })

    view = new EditorView({
        state,
        parent: document.getElementById(id) //document.body//
    })
}

var dotNetHelpers: { [id: string]: any } = {};

export function initDotNetHelpers(dotnetHelper: any, id: string)
{
    dotNetHelpers[id] = dotnetHelper;
}
