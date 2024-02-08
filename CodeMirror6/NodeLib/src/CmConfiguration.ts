import { Text } from "@codemirror/state"

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
    public fileNameOrExtension: string
    public autoFormatMarkdown: boolean
    public replaceEmojiCodes: boolean
    public resize: string
    public lineWrapping: boolean
    public lintingEnabled: boolean
    public mergeViewConfiguration: UnifiedMergeConfig | null
    public highlightTrailingWhitespace: boolean
    public highlightWhitespace: boolean
    public localStorageKey: string
}

export interface UnifiedMergeConfig {
    /**
    The other document to compare the editor content with.
    */
    original: Text | string;
    /**
    By default, the merge view will mark inserted and deleted text
    in changed chunks. Set this to false to turn that off.
    */
    highlightChanges?: boolean;
    /**
    Controls whether a gutter marker is shown next to changed lines.
    */
    gutter?: boolean;
    /**
    By default, deleted chunks are highlighted using the main
    editor's language. Since these are just fragments, not full
    documents, this doesn't always work well. Set this option to
    false to disable syntax highlighting for deleted lines.
    */
    syntaxHighlightDeletions?: boolean;
    /**
    Controls whether accept/reject buttons are displayed for each
    changed chunk. Defaults to true.
    */
    mergeControls?: boolean;
    /**
    Pass options to the diff algorithm.
    */
    diffConfig?: DiffConfig;
}

/**
Options passed to diffing functions.
*/
export interface DiffConfig {
    /**
    When given, this limits the depth of full (expensive) diff
    computations, causing them to give up and fall back to a faster
    but less precise approach when there is more than this many
    changed characters in a scanned range. This should help avoid
    quadratic running time on large, very different inputs.
    */
    scanLimit?: number;
}
