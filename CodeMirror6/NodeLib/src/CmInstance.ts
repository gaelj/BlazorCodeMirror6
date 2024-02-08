import { EditorView } from "@codemirror/view"
import { EditorState, Compartment } from "@codemirror/state"
import { CmSetup } from "./CmSetup"
import { DotNet } from "@microsoft/dotnet-js-interop"

/**
 * Stores the state of a CodeMirror instance and allow dynamic changes to the state
 */
export class CmInstance
{
    public dotNetHelper: DotNet.DotNetObject
    public state: EditorState
    public view: EditorView
    public setup: CmSetup
    public localStorageKey: string
    public languageCompartment: Compartment = new Compartment
    public markdownStylingCompartment: Compartment = new Compartment
    public tabSizeCompartment: Compartment = new Compartment
    public indentUnitCompartment: Compartment = new Compartment
    public placeholderCompartment: Compartment = new Compartment
    public themeCompartment: Compartment = new Compartment
    public readonlyCompartment: Compartment = new Compartment
    public editableCompartment: Compartment = new Compartment
    public keymapCompartment: Compartment = new Compartment
    public emojiReplacerCompartment: Compartment = new Compartment
    public lineWrappingCompartment: Compartment = new Compartment
    public unifiedMergeViewCompartment: Compartment = new Compartment
    public highlightTrailingWhitespaceCompartment: Compartment = new Compartment
    public highlightWhitespaceCompartment: Compartment = new Compartment
    public columnsStylingCompartment: Compartment = new Compartment
}

export const CMInstances: { [id: string]: CmInstance}  = {}
