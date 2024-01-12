using System.Text.Json.Serialization;

namespace GaelJ.BlazorCodeMirror6.Models;

/// <summary>
/// Represents a CodeMirror completion item.
/// </summary>
public class CodeMirrorCompletion
{
    /// <summary>
    /// The label to show in the completion picker. This is what input
    /// is matched against to determine whether a completion matches (and
    /// how well it matches).
    /// </summary>
    [JsonPropertyName("label")] public string Label { get; set; } = string.Empty;

    /// <summary>
    /// An optional override for the completion's visible label.
    /// </summary>
    [JsonPropertyName("displayLabel")] public string? DisplayLabel { get; set; }

    /// <summary>
    /// An optional short piece of information to show (with a different
    /// style) after the label.
    /// </summary>
    [JsonPropertyName("detail")] public string? Detail { get; set; }

    /// <summary>
    /// Additional info to show when the completion is selected.
    /// </summary>
    [JsonPropertyName("info")] public string? Info { get; set; }

    /// <summary>
    /// The type of the completion. This is used to pick an icon to show
    /// for the completion. Icons are styled with a CSS class created by
    /// appending the type name to `"cm-completionIcon-"`. You can
    /// define or restyle icons by defining these selectors. The base
    /// library defines simple icons for `class`, `constant`, `enum`,
    /// `function`, `interface`, `keyword`, `method`, `namespace`,
    /// `property`, `text`, `type`, and `variable`.
    /// </summary>
    [JsonPropertyName("type")] public string? Type { get; set; }

    /// <summary>
    /// When given, should be a number from -99 to 99 that adjusts how
    /// this completion is ranked compared to other completions that
    /// match the input as well as this one. A negative number moves it
    /// down the list, a positive number moves it up.
    /// </summary>
    [JsonPropertyName("boost")] public int? Boost { get; set; }

    /// <summary>
    /// Can be used to divide the completion list into sections.
    /// Completions in a given section (matched by name) will be grouped
    /// together, with a heading above them. Options without section
    /// will appear above all sections.
    /// </summary>
    [JsonPropertyName("section")] public CodeMirrorCompletionSection? Section { get; set; }
}

/// <summary>
/// Represents a section of CodeMirror completion items.
/// </summary>
public class CodeMirrorCompletionSection
{
    /// <summary>
    /// The name of the section. If no `render` method is present, this
    /// will be displayed above the options.
    /// </summary>
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;

    /// <summary>
    /// By default, sections are ordered alphabetically by name. To
    /// specify an explicit order, `rank` can be used. Sections with a
    /// lower rank will be shown above sections with a higher rank.
    /// </summary>
    [JsonPropertyName("rank")] public int? Rank { get; set; }
}
