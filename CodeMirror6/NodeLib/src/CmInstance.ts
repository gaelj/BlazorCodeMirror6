import { EditorView } from "@codemirror/view"
import { EditorState, Compartment } from "@codemirror/state"

/**
 * Stores the state of a CodeMirror instance and allow dynamic changes to the state
 */
export class CmInstance
{
    public dotNetHelper: any
    public state: EditorState
    public view: EditorView
    public languageCompartment: Compartment = new Compartment
    public markdownStylingCompartment: Compartment = new Compartment
    public tabSizeCompartment: Compartment = new Compartment
    public indentUnitCompartment: Compartment = new Compartment
    public placeholderCompartment: Compartment = new Compartment
    public themeCompartment: Compartment = new Compartment
    public readonlyCompartment: Compartment = new Compartment
    public editableCompartment: Compartment = new Compartment
    public keymapCompartment: Compartment = new Compartment
}
