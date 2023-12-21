using System.Text.Json.Serialization;

namespace CodeMirror6.Models;

/// <summary>
/// Represents a diagnostic message from a linter.
/// </summary>
public class CodeMirrorDiagnostic
{
    /// <summary>
    /// The start position of the relevant text, in characters counted from the start of the string.
    /// </summary>
    /// <value></value>
    [JsonPropertyName("from")] public int From { get; set; }
    /// <summary>
    /// The end position. May be equal to `from`, though actually
    /// covering text is preferable.
    /// </summary>
    /// <value></value>
    [JsonPropertyName("to")] public int To { get; set; }
    /// <summary>
    /// The severity of the problem. This will influence how it is
    /// displayed.
    /// </summary>
    /// <value>hint, info, warning, error</value>
    [JsonPropertyName("severity")] public string Severity { get; set; } = null!;
    /// <summary>
    /// When given, add an extra CSS class to parts of the code that
    /// this diagnostic applies to.
    /// </summary>
    /// <value></value>
    [JsonPropertyName("markClass")] public string? MarkClass { get; set; }
    /// <summary>
    /// An optional source string indicating where the diagnostic is
    /// coming from. You can put the name of your linter here, if
    /// applicable.
    /// </summary>
    /// <value></value>
    [JsonPropertyName("source")] public string? Source { get; set; }
    /// <summary>
    /// The message associated with this diagnostic.
    /// </summary>
    /// <value></value>
    [JsonPropertyName("message")] public string Message { get; set; } = null!;
}
