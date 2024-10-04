using System.Text.Json.Serialization;

namespace GaelJ.BlazorCodeMirror6.Models;

/// <summary>
/// Stores the configuration of a CodeMirror instance (what plugins to load).
/// Cannot be changed after the instance is created.
/// </summary>
public readonly record struct CodeMirrorSetup
{
    /// <summary>
    /// Default constructor
    /// </summary>
    public CodeMirrorSetup()
    {
    }

    /// <summary>
    /// Gets or sets the unique identifier for the CodeMirror6 editor.
    /// Defaults to CodeMirror6_Editor_{NewGuid}.
    /// </summary>
    [JsonPropertyName("id")] public string Id { get; init; } = $"CodeMirror6_Editor_{Guid.NewGuid()}";

    /// <summary>
    /// Whether to highlight special characters (whitespace, tabs, newlines).
    /// </summary>
    [JsonPropertyName("highlightSpecialChars")] public bool HighlightSpecialChars { get; init; } = true;

    /// <summary>
    /// Whether to enable undo/redo.
    /// </summary>
    [JsonPropertyName("history")] public bool History { get; init; } = true;

    /// <summary>
    /// Whether to enable code folding.
    /// </summary>
    [JsonPropertyName("foldGutter")] public bool FoldGutter { get; init; } = true;

    /// <summary>
    /// Whether to allow multiple selections.
    /// </summary>
    [JsonPropertyName("allowMultipleSelections")] public bool AllowMultipleSelections { get; init; } = true;

    /// <summary>
    /// Whether to indent the current line when a character is typed that might cause the line to be re-indented.
    /// </summary>
    [JsonPropertyName("indentOnInput")] public bool IndentOnInput { get; init; } = true;

    /// <summary>
    /// Whether to enable syntax highlighting.
    /// </summary>
    [JsonPropertyName("syntaxHighlighting")] public bool SyntaxHighlighting { get; init; } = true;

    /// <summary>
    /// Whether to highlight matching brackets.
    /// </summary>
    [JsonPropertyName("bracketMatching")] public bool BracketMatching { get; init; } = true;

    /// <summary>
    /// Whether to automatically close brackets.
    /// </summary>
    [JsonPropertyName("closeBrackets")] public bool CloseBrackets { get; init; } = true;

    /// <summary>
    /// Whether to enable autocompletion.
    /// </summary>
    [JsonPropertyName("autocompletion")] public bool Autocompletion { get; init; } = true;

    /// <summary>
    /// Whether to enable rectangular selection.
    /// </summary>
    [JsonPropertyName("rectangularSelection")] public bool RectangularSelection { get; init; } = true;

    /// <summary>
    /// Whether to enable crosshair selection.
    /// </summary>
    [JsonPropertyName("crossHairSelection")] public bool CrossHairSelection { get; init; } = true;

    /// <summary>
    /// Whether to highlight selection matches.
    /// </summary>
    [JsonPropertyName("highlightSelectionMatches")] public bool HighlightSelectionMatches { get; init; } = true;

    /// <summary>
    /// Whether to enable mentions.
    /// </summary>
    [JsonPropertyName("allowMentions")] public bool AllowMentions { get; init; } = true;

    /// <summary>
    /// Scroll the editor into view when the editor is created.
    /// </summary>
    [JsonPropertyName("scrollToStart")] public bool ScrollToStart { get; init; }

    /// <summary>
    /// Scroll the editor into view and scroll to the end of the document when the editor is created.
    /// </summary>
    [JsonPropertyName("scrollToEnd")] public bool ScrollToEnd { get; init; }

    /// <summary>
    /// The file icon css class to use for the editor
    /// </summary>
    [JsonPropertyName("fileIcon")] public string? FileIcon { get; init; } = "fa fa-file";

    /// <summary>
    /// URL of the Kroki server to use for rendering diagrams
    /// </summary>
    [JsonPropertyName("krokiUrl")] public string? KrokiUrl { get; init; } = "https://kroki.io";

    /// <summary>
    /// Bind value mode of the text area
    /// </summary>
    [JsonPropertyName("bindValueMode")] public DocumentBindMode BindMode { get; init; } = DocumentBindMode.OnLostFocus;

    /// <summary>
    /// Whether to show the debug logs
    /// </summary>
    [JsonPropertyName("debugLogs")] public bool DebugLogs { get; init; }

    /// <summary>
    /// Whether to focus on the editor when it is created
    /// </summary>
    [JsonPropertyName("focusOnCreation")] public bool FocusOnCreation { get; init; }

    /// <summary>
    /// Whether the tab key should be handled by the editor (to indent the current line), or be used to move focus to the next element (accessible mode)
    /// </summary>
    [JsonPropertyName("indentWithTab")] public bool IndentWithTab { get; init; } = true;
}
