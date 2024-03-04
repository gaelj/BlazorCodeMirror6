/**
 * Stores the configuration of a CodeMirror instance (what plugins to load).
 * Cannot be changed after the instance is created.
 */
export class CmSetup
{
    public highlightSpecialChars: boolean
    public history: boolean
    public foldGutter: boolean
    public allowMultipleSelections: boolean
    public indentOnInput: boolean
    public syntaxHighlighting: boolean
    public bracketMatching: boolean
    public closeBrackets: boolean
    public autocompletion: boolean
    public rectangularSelection: boolean
    public crossHairSelection: boolean
    public highlightSelectionMatches: boolean
    public allowMentions: boolean
    public scrollToEnd: boolean
    public fileIcon: string
    public bindValueMode: string
    public krokiUrl: string
    public debugLogs: boolean
    public focusOnCreation: boolean
}
