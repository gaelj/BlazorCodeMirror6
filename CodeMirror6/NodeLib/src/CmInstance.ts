import { EditorView } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";

export class CmInstance {
    public dotNetHelper: any;
    public language: Compartment = new Compartment;
    public tabSize: Compartment = new Compartment;
    public tabSizeValue: number;
    public state: EditorState;
    public view: EditorView;
}
