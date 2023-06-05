using System.Text.Json.Serialization;

namespace CodeMirror6.Models;

/// <summary>
/// DotNet port of the CM6 SelectionRange typescript class
/// </summary>
public class SelectionRange
{
    /// <summary>
    /// The lower boundary of the range.
    /// </summary>
    /// <value></value>
    [JsonPropertyName("from")] public int? From { get; set; }
    /// <summary>
    /// The upper boundary of the range.
    /// </summary>
    /// <value></value>
    [JsonPropertyName("to")] public int? To { get; set; }
}
