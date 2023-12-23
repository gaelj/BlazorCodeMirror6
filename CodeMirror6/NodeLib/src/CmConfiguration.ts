/**
 * Stores the initial configuration of a CodeMirror instance.
 */
export class CmConfiguration {
    public doc: string | null
    public placeholder: string
    public themeName: string | null
    public tabSize: number
    public indentationUnit: string
    public readOnly: boolean
    public editable: boolean
    public languageName: string
    public autoFormatMarkdownHeaders: boolean
}
