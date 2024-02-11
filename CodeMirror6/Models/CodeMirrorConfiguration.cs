using System.Text.Json.Serialization;

namespace GaelJ.BlazorCodeMirror6.Models;

/// <summary>
/// Represents the configuration of the CodeMirror editor.
/// These settings can be changed after the editor is created.
/// </summary>
/// <param name="doc"></param>
/// <param name="placeholder"></param>
/// <param name="themeName"></param>
/// <param name="tabSize"></param>
/// <param name="indentationUnit"></param>
/// <param name="readOnly"></param>
/// <param name="editable"></param>
/// <param name="languageName"></param>
/// <param name="autoFormatMarkdown"></param>
/// <param name="replaceEmojiCodes"></param>
/// <param name="resize">none, vertical, horizontal or both</param>
/// <param name="lineWrapping"></param>
/// <param name="lintingEnabled"></param>
/// <param name="mergeViewConfiguration"></param>
/// <param name="fileNameOrExtension"></param>
/// <param name="highlightTrailingWhitespace"></param>
/// <param name="highlightWhitespace"></param>
/// <param name="localStorageKey"></param>
/// <param name="fullScreen"></param>
/// <param name="supportFileUpload"></param>
public class CodeMirrorConfiguration(
    string? doc,
    string? placeholder,
    ThemeMirrorTheme? themeName,
    int tabSize,
    int indentationUnit,
    bool readOnly,
    bool editable,
    CodeMirrorLanguage? languageName,
    bool autoFormatMarkdown,
    bool replaceEmojiCodes,
    string resize,
    bool lineWrapping,
    bool lintingEnabled,
    UnifiedMergeConfig? mergeViewConfiguration,
    string? fileNameOrExtension,
    bool highlightTrailingWhitespace,
    bool highlightWhitespace,
    string? localStorageKey,
    bool fullScreen,
    bool supportFileUpload)
{
    /// <summary>
    /// The text to display in the editor
    /// </summary>
    [JsonPropertyName("doc")] public string? Doc { get; internal set; } = doc;

    /// <summary>
    /// The placeholder to display in the editor
    /// </summary>
    [JsonPropertyName("placeholder")] public string? Placeholder { get; internal set; } = placeholder;

    /// <summary>
    /// The theme to use for the editor
    /// </summary>
    [JsonPropertyName("themeName")] public ThemeMirrorTheme? ThemeName { get; internal set; } = themeName;

    /// <summary>
    /// The tab size to use for the editor
    /// </summary>
    [JsonPropertyName("tabSize")] public int TabSize { get; internal set; } = tabSize;

    /// <summary>
    /// The indent unit to use for the editor
    /// </summary>
    [JsonPropertyName("indentationUnit")] public int IndentationUnit { get; internal set; } = indentationUnit;

    /// <summary>
    /// Determine whether editing functionality should apply.
    /// Not to be confused with editable, which controls whether the editor's DOM is internal set to be editable (and thus focusable).
    /// </summary>
    [JsonPropertyName("readOnly")] public bool ReadOnly { get; internal set; } = readOnly;

    /// <summary>
    /// Controls whether the editor content DOM is editable
    /// </summary>
    [JsonPropertyName("editable")] public bool Editable { get; internal set; } = editable;

    /// <summary>
    /// The language to use in the editor
    /// </summary>
    [JsonPropertyName("languageName")] public CodeMirrorLanguage? LanguageName { get; internal set; } = languageName;

    /// <summary>
    /// The language to use in the editor
    /// </summary>
    [JsonPropertyName("fileNameOrExtension")] public string? FileNameOrExtension { get; internal set; } = fileNameOrExtension;

    /// <summary>
    /// Whether to automatically format (resize) markdown headers
    /// </summary>
    [JsonPropertyName("autoFormatMarkdown")] public bool AutoFormatMarkdown { get; internal set; } = autoFormatMarkdown;

    /// <summary>
    /// Whether to automatically replace :emoji_codes: with emoji
    /// </summary>
    [JsonPropertyName("replaceEmojiCodes")] public bool ReplaceEmojiCodes { get; internal set; } = replaceEmojiCodes;

    /// <summary>
    /// Controls whether the editor should have a resize handle like a textarea
    /// </summary>
    [JsonPropertyName("resize")] public string Resize { get; internal set; } = resize;

    /// <summary>
    /// Controls whether the editor wraps long lines of text, versus using scroll-bars
    /// </summary>
    [JsonPropertyName("lineWrapping")] public bool LineWrapping { get; internal set; } = lineWrapping;

    /// <summary>
    /// Did the user provide a linting callback
    /// </summary>
    [JsonPropertyName("lintingEnabled")] public bool LintingEnabled { get; internal set; } = lintingEnabled;

    /// <summary>
    /// Unified merged view configuration
    /// </summary>
    [JsonPropertyName("mergeViewConfiguration")] public UnifiedMergeConfig? MergeViewConfiguration { get; internal set; } = mergeViewConfiguration;

    /// <summary>
    /// Whether to highlight trailing whitespace
    /// </summary>
    [JsonPropertyName("highlightTrailingWhitespace")] public bool HighlightTrailingWhitespace { get; internal set; } = highlightTrailingWhitespace;

    /// <summary>
    /// Whether to highlight whitespace
    /// </summary>
    [JsonPropertyName("highlightWhitespace")] public bool HighlightWhitespace { get; internal set; } = highlightWhitespace;

    /// <summary>
    /// Optional local storage key to use for saving the document
    /// </summary>
    [JsonPropertyName("localStorageKey")] public string? LocalStorageKey { get; internal set; } = localStorageKey;
    /// <summary>
    /// Whether to display the editor in full screen mode
    /// </summary>
    [JsonPropertyName("fullScreen")] public bool FullScreen { get; internal set; } = fullScreen;

    /// <summary>
    /// Whether to support file upload
    /// </summary>
    [JsonPropertyName("supportFileUpload")] public bool SupportFileUpload { get; internal set; } = supportFileUpload;
}
