using System.Text.Json.Serialization;

namespace GaelJ.BlazorCodeMirror6.Models;

/// <summary>
/// Represents a diagnostic message from a linter.
/// </summary>
public record CodeMirrorDiagnostic
{
    /// <summary>
    /// The start position of the relevant text, in characters counted from the start of the string.
    /// </summary>
    [JsonPropertyName("from")] public int From { get; init; }
    /// <summary>
    /// The end position. May be equal to `from`, though actually
    /// covering text is preferable.
    /// </summary>
    [JsonPropertyName("to")] public int To { get; init; }
    /// <summary>
    /// The severity of the problem. This will influence how it is
    /// displayed.
    /// </summary>
    /// <value>hint, info, warning, error</value>
    [JsonPropertyName("severity")] public string Severity { get; init; } = null!;
    /// <summary>
    /// When given, add an extra CSS class to parts of the code that
    /// this diagnostic applies to.
    /// </summary>
    [JsonPropertyName("markClass")] public string? MarkClass { get; init; }
    /// <summary>
    /// An optional source string indicating where the diagnostic is
    /// coming from. You can put the name of your linter here, if
    /// applicable.
    /// </summary>
    [JsonPropertyName("source")] public string? Source { get; init; }
    /// <summary>
    /// The message associated with this diagnostic.
    /// </summary>
    [JsonPropertyName("message")] public string Message { get; init; } = null!;
}
