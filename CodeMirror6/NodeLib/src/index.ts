import {basicSetup} from "codemirror"
import {EditorView, keymap, placeholder} from "@codemirror/view"
import {EditorState, Compartment, Extension} from "@codemirror/state"
import {indentWithTab} from "@codemirror/commands"
import { indentUnit } from "@codemirror/language"
import {cpp} from "@codemirror/lang-cpp"
import {css} from "@codemirror/lang-css"
import {html} from "@codemirror/lang-html"
import {javascript} from "@codemirror/lang-javascript"
import {json} from "@codemirror/lang-json"
import {markdown, markdownLanguage} from "@codemirror/lang-markdown"
import {python} from "@codemirror/lang-python"
import {sql} from "@codemirror/lang-sql"
import {xml} from "@codemirror/lang-xml"
import {languages} from "@codemirror/language-data"
import {autocompletion} from "@codemirror/autocomplete"
import {CmInstance, CmConfig} from "./CmInstance"
import {amy, ayuLight, barf, bespin, birdsOfParadise, boysAndGirls, clouds, cobalt, coolGlow, dracula, espresso, noctisLilac, rosePineDawn, smoothy, solarizedLight, tomorrow} from 'thememirror'

let CMInstances: { [id: string]: CmInstance } = {}

export function initCodeMirror(
    dotnetHelper: any,
    id: string,
    config: CmConfig
) {
    var languageCompartment = new Compartment
    var tabSizeCompartment = new Compartment
    var indentUnitCompartment = new Compartment
    var placeholderCompartment = new Compartment
    var themeCompartment = new Compartment

    let extensions = [
        basicSetup,
        languageCompartment.of(markdown({ base: markdownLanguage, codeLanguages: languages })),
        tabSizeCompartment.of(EditorState.tabSize.of(config.tabSize)),
        indentUnitCompartment.of(indentUnit.of(" ".repeat(config.tabSize))),
        keymap.of([indentWithTab]),

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
                await dotnetHelper.invokeMethodAsync("SelectionSetFromJS", update.state.selection.ranges.map(r => {return {from: r.from, to: r.to}}))
            }
        }),
        placeholderCompartment.of(placeholder(config.placeholder)),
        themeCompartment.of(getTheme(config.themeName)),
        autocompletion()
    ]

    var state = EditorState.create({
        doc: config.doc,
        extensions: extensions
    })

    var view = new EditorView({
        state,
        parent: document.getElementById(id),
    })

    CMInstances[id] = new CmInstance()

    CMInstances[id].dotNetHelper = dotnetHelper
    CMInstances[id].state = state
    CMInstances[id].view = view
    CMInstances[id].tabSizeCompartment = tabSizeCompartment
    CMInstances[id].indentUnitCompartment = indentUnitCompartment
    CMInstances[id].tabSize = config.tabSize
    CMInstances[id].language = languageCompartment
    CMInstances[id].placeholderCompartment = placeholderCompartment
    CMInstances[id].themeCompartment = themeCompartment
}

export function setTabSize(id: string, size: number)
{
    CMInstances[id].tabSize = size
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].tabSizeCompartment.reconfigure(EditorState.tabSize.of(size))
    })
}

export function setIndentUnit(id: string, indentUnitString: string) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].indentUnitCompartment.reconfigure(indentUnit.of(indentUnitString))
    })
}

export function setDoc(id: string, text: string)
{
    const transaction = CMInstances[id].view.state.update({
        changes: {from: 0, to: CMInstances[id].view.state.doc.length, insert: text}
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
            effects: CMInstances[id].themeCompartment.reconfigure(getTheme(themeName))
        })
    }
}

// Return the thememirror theme Extension matching the supplied string
function getTheme(themeName: string): Extension {
    switch (themeName) {
        case "Amy":
            return amy
        case "AyuLight":
            return ayuLight
        case "Barf":
            return barf
        case "Bespin":
            return bespin
        case "BirdsOfParadise":
            return birdsOfParadise
        case "BoysAndGirls":
            return boysAndGirls
        case "Clouds":
            return clouds
        case "Cobalt":
            return cobalt
        case "CoolGlow":
            return coolGlow
        case "Dracula":
            return dracula
        case "Espresso":
            return espresso
        case "NoctisLilac":
            return noctisLilac
        case "RosePineDawn":
            return rosePineDawn
        case "Smoothy":
            return smoothy
        case "SolarizedLight":
            return solarizedLight
        case "Tomorrow":
            return tomorrow
        case "Dracula":
            return dracula
        default:
            return EditorView.baseTheme({})
    }
}

export function dispose(id: string)
{
    CMInstances[id] = undefined
    delete CMInstances[id]
}
