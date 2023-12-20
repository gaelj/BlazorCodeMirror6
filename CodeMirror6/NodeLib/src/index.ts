import { basicSetup } from "codemirror"
import { EditorView, keymap, placeholder } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { indentWithTab } from "@codemirror/commands"
import { indentUnit } from "@codemirror/language"
import { autocompletion } from "@codemirror/autocomplete"
import { CmInstance } from "./CmInstance"
import { CmConfig } from "./CmConfig"
import { languageChangeEffect, getDynamicHeaderStyling } from "./CmDynamicMarkdownHeaderStyling"
import { getTheme } from "./CmTheme"
import { getLanguage } from "./CmLanguage"

let CMInstances: { [id: string]: CmInstance } = {}

export function initCodeMirror(
    dotnetHelper: any,
    id: string,
    config: CmConfig
) {
    CMInstances[id] = new CmInstance()
    CMInstances[id].dotNetHelper = dotnetHelper

    let extensions = [
        basicSetup,
        CMInstances[id].languageCompartment.of(getLanguage(config.languageName)),
        CMInstances[id].markdownStylingCompartment.of(getDynamicHeaderStyling(config.autoFormatMarkdownHeaders)),
        CMInstances[id].keymapCompartment.of(keymap.of([indentWithTab])),
        CMInstances[id].tabSizeCompartment.of(EditorState.tabSize.of(config.tabSize)),
        CMInstances[id].indentUnitCompartment.of(indentUnit.of(" ".repeat(config.tabSize))),

        EditorView.updateListener.of(async (update) => {
            if (update.docChanged) {
                await dotnetHelper.invokeMethodAsync("DocChangedFromJS", update.state.doc.toString())
            }
            if (update.focusChanged) {
                await dotnetHelper.invokeMethodAsync("FocusChangedFromJS", update.view.hasFocus)
                if (!update.view.hasFocus)
                    await dotnetHelper.invokeMethodAsync("DocChangedFromJS", update.state.doc.toString())
            }
            if (update.selectionSet) {
                await dotnetHelper.invokeMethodAsync("SelectionSetFromJS", update.state.selection.ranges.map(r => { return { from: r.from, to: r.to } }))
            }
        }),

        CMInstances[id].placeholderCompartment.of(placeholder(config.placeholder)),
        CMInstances[id].themeCompartment.of(getTheme(config.themeName)),
        CMInstances[id].readonlyCompartment.of(EditorState.readOnly.of(config.readOnly)),
        CMInstances[id].editableCompartment.of(EditorView.editable.of(config.editable)),
        autocompletion()
    ]

    CMInstances[id].state = EditorState.create({
        doc: config.doc,
        extensions: extensions
    })

    CMInstances[id].view = new EditorView({
        state: CMInstances[id].state,
        parent: document.getElementById(id),
    })
}

export function setTabSize(id: string, size: number) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].tabSizeCompartment.reconfigure(EditorState.tabSize.of(size))
    })
}

export function setIndentUnit(id: string, indentUnitString: string) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].indentUnitCompartment.reconfigure(indentUnit.of(indentUnitString))
    })
}

export function setDoc(id: string, text: string) {
    const transaction = CMInstances[id].view.state.update({
        changes: { from: 0, to: CMInstances[id].view.state.doc.length, insert: text }
    })
    CMInstances[id].view.dispatch(transaction)
}

export function setPlaceholderText(id: string, text: string) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].placeholderCompartment.reconfigure(placeholder(text))
    })
}

export function setTheme(id: string, themeName: string) {
    const theme = getTheme(themeName)
    if (theme !== null) {
        CMInstances[id].view.dispatch({
            effects: CMInstances[id].themeCompartment.reconfigure(theme)
        })
    }
}

export function setReadOnly(id: string, readOnly: boolean) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].readonlyCompartment.reconfigure(EditorState.readOnly.of(readOnly))
    })
}

export function setEditable(id: string, editable: boolean) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].editableCompartment.reconfigure(EditorView.editable.of(editable))
    })
}

export function setLanguage(id: string, languageName: string) {
    const language = getLanguage(languageName)
    CMInstances[id].view.dispatch({
        effects: [
            CMInstances[id].languageCompartment.reconfigure(language),
            languageChangeEffect.of(language.language)
        ]
    })
}

export function setAutoFormatMarkdownHeaders(id: string, autoFormatMarkdownHeaders: boolean) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].markdownStylingCompartment.reconfigure(getDynamicHeaderStyling(autoFormatMarkdownHeaders))
    })
}

export function dispose(id: string) {
    CMInstances[id].view.destroy()
    CMInstances[id] = undefined
    delete CMInstances[id]
}
