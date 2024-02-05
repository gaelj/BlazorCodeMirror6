using System.Text.Json.Serialization;

namespace GaelJ.BlazorCodeMirror6.Models;

/// <summary>
/// Built-in CodeMirror commands expecting 2 parameters
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CodeMirrorCommandTwoParameters
{
    /// <summary>
    /// Insert a markdown table at the current selection
    /// </summary>
    InsertTable,
}
