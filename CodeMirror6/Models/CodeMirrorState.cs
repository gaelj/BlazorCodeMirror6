namespace CodeMirror6.Models;

/// <summary>
/// Represents the current state of the CodeMirror6 editor
/// </summary>
public class CodeMirrorState
{
    /// <summary>
    /// List of markdown styles active at the current selection(s)
    /// </summary>
    /// <value></value>
    public List<string> MarkdownStylesAtSelections { get; internal set; } = [];
}
