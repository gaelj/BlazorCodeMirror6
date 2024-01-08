using System.Text.Json.Serialization;

namespace CodeMirror6.Models;

/// <summary>
/// Bind value mode of the document
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum DocumentBindMode
{
    /// <summary>
    /// The document is bound to the text area on input
    /// </summary>
    OnInput,

    /// <summary>
    /// The document is bound to the text area on lost focus
    /// </summary>
    OnLostFocus,

    /// <summary>
    /// The document is bound to the text area on delayed input
    /// </summary>
    OnDelayedInput,
}
