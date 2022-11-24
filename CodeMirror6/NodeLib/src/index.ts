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
import {CmInstance} from "./CmInstance"

let CMInstances: { [id: string]: CmInstance } = {}

export function initCodeMirror(
    dotnetHelper: any,
    id: string,
    initialText: string,
    placeholderText: string,
    tabulationSize: number
) {
    var language = new Compartment
    var tabSize = new Compartment
    var state = EditorState.create({
        doc: initialText,
        extensions: [
            basicSetup,
            language.of(markdown({ base: markdownLanguage, codeLanguages: languages })),
            tabSize.of(EditorState.tabSize.of(tabulationSize)),
            keymap.of([indentWithTab]),
            EditorView.updateListener.of(async (update) => {
                if (update.docChanged) {
                    await dotnetHelper.invokeMethodAsync("DocChanged", update.state.doc.toString());
                }
                if (update.focusChanged) {
                    await dotnetHelper.invokeMethodAsync("FocusChanged", update.view.hasFocus);
                    if (!update.view.hasFocus)
                        await dotnetHelper.invokeMethodAsync("DocChanged", update.state.doc.toString());
                }
                if (update.selectionSet) {
                    await dotnetHelper.invokeMethodAsync("SelectionSet", update.state.selection.ranges.map(r => {return {from: r.from, to: r.to}}));
                }
            }),
            placeholder(placeholderText),
            autocompletion(),
        ]
    })

    var view = new EditorView({
        state,
        parent: document.getElementById(id),
    })

    CMInstances[id] = new CmInstance();

    CMInstances[id].dotNetHelper = dotnetHelper
    CMInstances[id].state = state
    CMInstances[id].view = view
    CMInstances[id].tabSize = tabSize
    CMInstances[id].language = language
}

export function setTabSize(id: string, size: number)
{
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].tabSize.reconfigure(EditorState.tabSize.of(size))
    })
}

export function setText(id: string, text: string)
{
    const transaction = CMInstances[id].view.state.update({
        changes: {from: 0, to: CMInstances[id].view.state.doc.length, insert: text}
    })
    CMInstances[id].view.dispatch(transaction)
}

export function dispose(id: string)
{
    CMInstances[id] = undefined;
}