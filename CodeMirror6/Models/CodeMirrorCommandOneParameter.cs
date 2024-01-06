using System.Text.Json.Serialization;

namespace CodeMirror6.Models;

/// <summary>
/// Built-in CodeMirror commands expecting 1 parameter
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CodeMirrorCommandOneParameter
{
    /// <summary>
    /// Toggle markdown header formatting for the selected line
    /// </summary>
    ToggleMarkdownHeading,

    /// <summary>
    /// Insert at selection or replace selected text
    /// </summary>
    InsertOrReplaceText,

    /// <summary>
    /// Insert text above the selected text's line
    /// </summary>
    InsertTextAbove,
}
