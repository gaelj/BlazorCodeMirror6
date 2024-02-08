using System.Collections.ObjectModel;

namespace GaelJ.BlazorCodeMirror6.Models;

/// <summary>
/// Represents the current state of the CodeMirror6 editor
/// </summary>
public class CodeMirrorState
{
    /// <summary>
    /// List of markdown styles active at the current selection(s)
    /// </summary>
    public ReadOnlyCollection<string> MarkdownStylesAtSelections { get; internal set; } = new([]);

    /// <summary>
    /// Has the editor received focus
    /// </summary>
    public bool HasFocus;
}
