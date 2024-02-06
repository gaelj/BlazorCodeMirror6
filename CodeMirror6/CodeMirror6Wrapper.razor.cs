using System.Collections.ObjectModel;
using GaelJ.BlazorCodeMirror6.Models;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Http;

namespace GaelJ.BlazorCodeMirror6;

/// <summary>
/// Code-behind for the CodeMirror6Wrapper component
/// </summary>
public partial class CodeMirror6Wrapper : ComponentBase
{
    /// <summary>
    /// /// Gets or sets the unique identifier for the CodeMirror6 editor.
    /// Defaults to CodeMirror6_Editor_{NewGuid}.
    /// </summary>
    /// <value></value>
    [Parameter] public string Id { get; set; } = $"CodeMirror6_Editor_{Guid.NewGuid()}";
    /// <summary>
    /// The size of the tab character to use for the editor
    /// </summary>
    /// <value></value>
    [Parameter] public int TabSize { get; set; } = 2;
    /// <summary>
    /// The number of spaces to use for indentation
    /// </summary>
    /// <value></value>
    [Parameter] public int IndentationUnit { get; set; } = 2;
    /// <summary>
    /// The document contents
    /// </summary>
    /// <value></value>
    [Parameter] public string? Doc { get; set; }
    /// <summary>
    /// The document contents has changed
    /// </summary>
    /// <value></value>
    [Parameter] public EventCallback<string?> DocChanged { get; set; }
    /// <summary>
    /// The placeholder text to display in an empty editor
    /// </summary>
    /// <value></value>
    [Parameter] public string? Placeholder { get; set; }
    /// <summary>
    /// The document focus has changed
    /// </summary>
    /// <value></value>
    [Parameter] public EventCallback<bool> FocusChanged { get; set; }
    /// <summary>
    /// Set the cursor position or selections
    /// </summary>
    /// <value></value>
    [Parameter] public List<SelectionRange>? Selection { get; set; }
    /// <summary>
    /// The cursor position or selections have changed
    /// </summary>
    /// <value></value>
    [Parameter] public EventCallback<List<SelectionRange>?> SelectionChanged { get; set; }
    /// <summary>
    /// The theme to use for the editor
    /// </summary>
    /// <value></value>
    [Parameter] public ThemeMirrorTheme? Theme { get; set; }
    /// <summary>
    /// Determine whether editing functionality should apply.
    /// </summary>
    /// <value></value>
    [Parameter] public bool ReadOnly { get; set; }
    /// <summary>
    /// Controls whether the editor content DOM is editable
    /// </summary>
    /// <value></value>
    [Parameter] public bool Editable { get; set; } = true;
    /// <summary>
    /// Controls whether long lines should wrap
    /// </summary>
    /// <value></value>
    [Parameter] public bool LineWrapping { get; set; } = true;
    /// <summary>
    /// The language to use in the editor
    /// </summary>
    /// <value></value>
    [Parameter] public CodeMirrorLanguage? Language { get; set; } = CodeMirrorLanguage.Markdown;
    /// <summary>
    /// Define a file name or file extension to be used for automatic language detection / syntax highlighting
    /// </summary>
    [Parameter] public string? FileNameOrExtension { get; set; }
    /// <summary>
    /// Automatically format (resize) markdown headers
    /// </summary>
    /// <value></value>
    [Parameter] public bool AutoFormatMarkdown { get; set; }
    /// <summary>
    /// Content to be rendered before the editor
    /// </summary>
    /// <value></value>
    [Parameter] public RenderFragment<(CMCommandDispatcher Commands, CodeMirrorConfiguration Config, CodeMirrorState State)>? ContentBefore { get; set; }
    /// <summary>
    /// Content to be rendered after the editor
    /// </summary>
    /// <value></value>
    [Parameter] public RenderFragment<(CMCommandDispatcher Commands, CodeMirrorConfiguration Config, CodeMirrorState State)>? ContentAfter { get; set; }
    /// <summary>
    /// The active markdown styles at the current selection(s)
    /// </summary>
    /// <value></value>
    [Parameter] public EventCallback<ReadOnlyCollection<string>> MarkdownStylesAtSelectionsChanged { get; set; }
    /// <summary>
    /// Whether to allow vertical resizing similar to a textarea
    /// </summary>
    [Parameter] public bool AllowVerticalResize { get; set; } = true;
    /// <summary>
    /// Whether to allow horizontal resizing similar to a textarea
    /// </summary>
    /// <value></value>
    [Parameter] public bool AllowHorizontalResize { get; set; }
    /// <summary>
    /// Find any errors in the document
    /// </summary>
    /// <value></value>
    [Parameter] public Func<string, CancellationToken, Task<List<CodeMirrorDiagnostic>>>? LintDocument { get; set; }
    /// <summary>
    /// The CodeMirror setup
    /// </summary>
    /// <value></value>
    [Parameter] public CodeMirrorSetup Setup { get; set; } = new();
    /// <summary>
    /// Whether to replace :emoji_codes: with emoji
    /// </summary>
    /// <value></value>
    [Parameter] public bool ReplaceEmojiCodes { get; set; } = false;
    /// <summary>
    /// Get all users available for &#64;user mention completions
    /// </summary>
    /// <value></value>
    [Parameter] public Func<Task<List<CodeMirrorCompletion>>>? GetMentionCompletions { get; set; }
    /// <summary>
    /// Upload a file to a server and return the URL to the file
    /// </summary>
    /// <value></value>
    [Parameter] public Func<IFormFile, Task<string>>? UploadFile { get; set; }
    /// <summary>
    /// Upload an IBrowserFile to a server and returns the URL to the file
    /// </summary>
    [Parameter] public Func<IBrowserFile, Task<string>>? UploadBrowserFile { get; set; }
    /// <summary>
    /// Define whether the component is used in a WASM or Server app. In a WASM app, JS interop can start sooner
    /// </summary>
    [Parameter] public bool IsWASM { get; set; }
    /// <summary>
    /// The unified merge view configuration
    /// </summary>
    /// <value></value>
    [Parameter] public UnifiedMergeConfig? MergeViewConfiguration { get; set; }
    /// <summary>
    /// Whether to allow horizontal resizing similar to a textarea
    /// </summary>
    /// <value></value>
    [Parameter] public bool HighlightTrailingWhitespace { get; set; }
    /// <summary>
    /// Whether to allow horizontal resizing similar to a textarea
    /// </summary>
    /// <value></value>
    [Parameter] public bool HighlightWhitespace { get; set; }
    /// <summary>
    /// Whether the editor is visible
    /// </summary>
    /// <value></value>
    [Parameter] public bool Visible { get; set; } = true;
    /// <summary>
    /// Additional attributes to be applied to the container element
    /// </summary>
    /// <value></value>
    [Parameter(CaptureUnmatchedValues = true)] public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Methods to invoke JS CodeMirror commands.
    /// </summary>
    /// <returns></returns>
    public CMCommandDispatcher? CommandDispatcher => CodeMirror6WrapperInternalRef.CmJsInterop?.CommandDispatcher;

    private CodeMirror6WrapperInternal CodeMirror6WrapperInternalRef = null!;
    private ErrorBoundary? ErrorBoundary;

    /// <summary>
    /// Component parameters have been set
    /// </summary>
    protected override void OnParametersSet()
    {
        base.OnParametersSet();
        ErrorBoundary?.Recover();
    }
}
