/// <summary>
/// Stores the initial configuration of a CodeMirror instance.
/// </summary>
export class CmConfig {
    public doc: string | null;
    public placeholder: string;
    public themeName: string | null;
    public tabSize: number;
    public indentationUnit: string;
}
