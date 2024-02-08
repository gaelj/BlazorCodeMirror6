using System.Text.Json.Serialization;

namespace GaelJ.BlazorCodeMirror6.Models;

/// <summary>
/// codeMirror unified merge view plugin configuration.
/// </summary>
public record UnifiedMergeConfig
{
    /// <summary>
    /// The other document to compare the editor content with.
    /// </summary>
    [JsonPropertyName("original")] public string Original { get; set; } = string.Empty;

    /// <summary>
    /// By default, the merge view will mark inserted and deleted text
    /// in changed chunks. Set this to false to turn that off.
    /// </summary>
    [JsonPropertyName("highlightChanges")] public bool? HighlightChanges { get; set; }

    /// <summary>
    /// Controls whether a gutter marker is shown next to changed lines.
    /// </summary>
    [JsonPropertyName("gutter")] public bool? Gutter { get; set; }

    /// <summary>
    /// By default, deleted chunks are highlighted using the main
    /// editor's language. Since these are just fragments, not full
    /// documents, this doesn't always work well. Set this option to
    /// false to disable syntax highlighting for deleted lines.
    /// </summary>
    [JsonPropertyName("syntaxHighlightDeletions")] public bool? SyntaxHighlightDeletions { get; set; }

    /// <summary>
    /// Controls whether accept/reject buttons are displayed for each
    /// changed chunk. Defaults to true.
    /// </summary>
    [JsonPropertyName("mergeControls")] public bool? MergeControls { get; set; }

    /// <summary>
    /// Pass options to the diff algorithm.
    /// </summary>
    [JsonPropertyName("diffConfig")] public DiffConfig? DiffConfig { get; set; }
}

/// <summary>
/// Options passed to diffing functions.
/// </summary>
public record DiffConfig
{
    /// <summary>
    /// When given, this limits the depth of full (expensive) diff
    /// computations, causing them to give up and fall back to a faster
    /// but less precise approach when there is more than this many
    /// changed characters in a scanned range. This should help avoid
    /// quadratic running time on large, very different inputs.
    /// </summary>
    [JsonPropertyName("scanLimit")] public int? ScanLimit { get; set; }
}
