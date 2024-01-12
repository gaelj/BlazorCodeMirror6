using System.Text.Json.Serialization;

namespace GaelJ.BlazorCodeMirror6.Models;

/// <summary>
/// Available languages for the CodeMirror editor
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CodeMirrorLanguage
{
    /// <summary>
    /// Plain text
    /// </summary>
    PlainText,
    /// <summary>
    /// C#
    /// </summary>
    Csharp,
    /// <summary>
    /// C++
    /// </summary>
    Cpp,
    /// <summary>
    /// CSS style sheets
    /// </summary>
    Css,
    /// <summary>
    /// HTML
    /// </summary>
    Html,
    /// <summary>
    /// Java
    /// </summary>
    Java,
    /// <summary>
    /// JavaScript
    /// </summary>
    Javascript,
    /// <summary>
    /// JSON
    /// </summary>
    Json,
    /// <summary>
    /// Lezer
    /// </summary>
    Lezer,
    /// <summary>
    /// Markdown
    /// </summary>
    Markdown,
    /// <summary>
    /// Mermaid
    /// </summary>
    Mermaid,
    /// <summary>
    /// Python
    /// </summary>
    Python,
    /// <summary>
    /// Rust
    /// </summary>
    Rust,
    /// <summary>
    /// SASS
    /// </summary>
    Sass,
    /// <summary>
    /// SQL
    /// </summary>
    Sql,
    /// <summary>
    /// XML
    /// </summary>
    Xml,
}
