import { EditorView } from "@codemirror/view"
import { EditorState, Compartment } from "@codemirror/state"


/// <summary>
/// Stores the state of a CodeMirror instance.
/// </summary>
export class CmInstance
{
    public dotNetHelper: any
    public state: EditorState
    public view: EditorView
    public language: Compartment = new Compartment
    public tabSizeCompartment: Compartment = new Compartment
    public indentUnitCompartment: Compartment = new Compartment
    public tabSize: number
    public placeholderCompartment: Compartment = new Compartment
    public themeCompartment: Compartment = new Compartment
}
