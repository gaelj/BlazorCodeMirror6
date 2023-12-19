import { EditorView } from "@codemirror/view"
import { EditorState, Compartment } from "@codemirror/state"

export class CmInstance {
    public dotNetHelper: any
    public language: Compartment = new Compartment
    public tabSizeCompartment: Compartment = new Compartment
    public indentUnitCompartment: Compartment = new Compartment
    public tabSize: number
    public state: EditorState
    public view: EditorView
    public placeholderCompartment: Compartment
    public themeCompartment: Compartment = new Compartment
}
