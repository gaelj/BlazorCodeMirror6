using System.Collections.ObjectModel;
using GaelJ.BlazorCodeMirror6.Models;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Components.Web;

namespace GaelJ.BlazorCodeMirror6;

/// <summary>
/// Code-behind for the CodeMirror6Wrapper component
/// </summary>
public partial class CodeMirror6Wrapper : ComponentBase
{
    /// <summary>
    /// The size of the tab character to use for the editor
    /// </summary>
    [Parameter] public int TabSize { get; set; } = 2;
    /// <summary>
    /// The number of spaces to use for indentation
    /// </summary>
    [Parameter] public int IndentationUnit { get; set; } = 2;
    /// <summary>
    /// The document contents
    /// </summary>
    [Parameter] public string? Doc { get; set; }
    /// <summary>
    /// The document contents has changed
    /// </summary>
    [Parameter] public EventCallback<string?> DocChanged { get; set; }
    /// <summary>
    /// The placeholder text to display in an empty editor
    /// </summary>
    [Parameter] public string? Placeholder { get; set; }
    /// <summary>
    /// The document focus has changed
    /// </summary>
    [Parameter] public EventCallback<bool> FocusChanged { get; set; }
    /// <summary>
    /// Set the cursor position or selections
    /// </summary>
    [Parameter] public List<SelectionRange>? Selection { get; set; }
    /// <summary>
    /// The cursor position or selections have changed
    /// </summary>
    [Parameter] public EventCallback<List<SelectionRange>?> SelectionChanged { get; set; }
    /// <summary>
    /// The theme to use for the editor
    /// </summary>
    [Parameter] public ThemeMirrorTheme? Theme { get; set; }
    /// <summary>
    /// Determine whether editing functionality should apply.
    /// </summary>
    [Parameter] public bool ReadOnly { get; set; }
    /// <summary>
    /// Controls whether the editor content DOM is editable
    /// </summary>
    [Parameter] public bool Editable { get; set; } = true;
    /// <summary>
    /// Controls whether long lines should wrap
    /// </summary>
    [Parameter] public bool LineWrapping { get; set; } = true;
    /// <summary>
    /// The language to use in the editor
    /// </summary>
    [Parameter] public CodeMirrorLanguage? Language { get; set; } = CodeMirrorLanguage.Markdown;
    /// <summary>
    /// Define a file name or file extension to be used for automatic language detection / syntax highlighting
    /// </summary>
    [Parameter] public string? FileNameOrExtension { get; set; }
    /// <summary>
    /// Automatically format (resize) markdown headers
    /// </summary>
    [Parameter] public bool AutoFormatMarkdown { get; set; }
    /// <summary>
    /// Content to be rendered before the editor
    /// </summary>
    [Parameter] public RenderFragment<(CMCommandDispatcher Commands, CodeMirrorConfiguration Config, CodeMirrorState State)>? ContentBefore { get; set; }
    /// <summary>
    /// Content to be rendered after the editor
    /// </summary>
    [Parameter] public RenderFragment<(CMCommandDispatcher Commands, CodeMirrorConfiguration Config, CodeMirrorState State)>? ContentAfter { get; set; }
    /// <summary>
    /// The active markdown styles at the current selection(s)
    /// </summary>
    [Parameter] public EventCallback<ReadOnlyCollection<string>> MarkdownStylesAtSelectionsChanged { get; set; }
    /// <summary>
    /// Whether to allow vertical resizing similar to a textarea
    /// </summary>
    [Parameter] public bool AllowVerticalResize { get; set; } = true;
    /// <summary>
    /// Whether to allow horizontal resizing similar to a textarea
    /// </summary>
    [Parameter] public bool AllowHorizontalResize { get; set; }
    /// <summary>
    /// Find any errors in the document
    /// </summary>
    [Parameter] public Func<string, CancellationToken, Task<List<CodeMirrorDiagnostic>>>? LintDocument { get; set; }
    /// <summary>
    /// The CodeMirror setup
    /// </summary>
    [Parameter] public CodeMirrorSetup Setup { get; set; } = new();
    /// <summary>
    /// Whether to replace :emoji_codes: with emoji
    /// </summary>
    [Parameter] public bool ReplaceEmojiCodes { get; set; } = false;
    /// <summary>
    /// Get all users available for &#64;user mention completions
    /// </summary>
    [Parameter] public Func<Task<List<CodeMirrorCompletion>>>? GetMentionCompletions { get; set; }
    /// <summary>
    /// Upload an IBrowserFile to a server and returns the URL to the file
    /// </summary>
    [Parameter] public Func<IBrowserFile, Task<string>>? UploadBrowserFile { get; set; }
    /// <summary>
    /// Whether to embed uploads as data URLs instead of using the custom callback. Warning: this can cause performance issues, especially in Blazor Server apps.
    /// </summary>
    [Parameter] public bool EmbedUploadsAsDataUrls { get; set; }
    /// <summary>
    /// Define whether the component is used in a WASM or Server app. In a WASM app, JS interop can start sooner
    /// </summary>
    [Parameter] public bool IsWASM { get; set; }
    /// <summary>
    /// The unified merge view configuration
    /// </summary>
    [Parameter] public UnifiedMergeConfig? MergeViewConfiguration { get; set; }
    /// <summary>
    /// Whether to allow horizontal resizing similar to a textarea
    /// </summary>
    [Parameter] public bool HighlightTrailingWhitespace { get; set; }
    /// <summary>
    /// Whether to allow horizontal resizing similar to a textarea
    /// </summary>
    [Parameter] public bool HighlightWhitespace { get; set; }
    /// <summary>
    /// Whether the editor is visible
    /// </summary>
    [Parameter] public bool Visible { get; set; } = true;
    /// <summary>
    /// Optional local storage key to use for saving the document.
    /// Remember to dispatch the command CodeMirrorSimpleCommand.ClearLocalStorage
    /// to clear the local storage, for example after submitting the form.
    /// </summary>
    [Parameter] public string? LocalStorageKey { get; set; }
    /// <summary>
    /// The z-index to use for the full screen mode. Defaults to 3.
    /// </summary>
    /// <value></value>
    [Parameter] public int FullScreenZIndex { get; set; } = 3;
    /// <summary>
    /// The full screen background color to use. Defaults to var(--bs-body-bg).
    /// </summary>
    [Parameter] public string? FullScreenBackgroundColor { get; set; } = "var(--bs-body-bg)";
    /// <summary>
    /// Whether the editor is is full screen mode
    /// </summary>
    [Parameter] public bool FullScreen { get; set; }
    /// <summary>
    /// Optional CSS width of the editor. Overridden when in full screen mode.
    /// </summary>
    /// <value></value>
    [Parameter] public string? Width { get; set; }
    /// <summary>
    /// Optional CSS height of the editor. Overridden when in full screen mode.
    /// </summary>
    /// <value></value>
    [Parameter] public string? Height { get; set; }
    /// <summary>
    /// Optional CSS max-width of the editor. Overridden when in full screen mode.
    /// </summary>
    /// <value></value>
    [Parameter] public string? MaxWidth { get; set; }
    /// <summary>
    /// Optional CSS max-height of the editor. Overridden when in full screen mode.
    /// </summary>
    /// <value></value>
    [Parameter] public string? MaxHeight { get; set; }
    /// <summary>
    /// Optional maximum document length, in characters. A linting error will be raised if the document exceeds this length.
    /// </summary>
    [Parameter] public int? MaxDocumentLength { get; set; }
    /// <summary>
    /// Whether to show line numbers to the left of the editor.
    /// </summary>
    [Parameter] public bool LineNumbers { get; init; } = true;
    /// <summary>
    /// Whether to highlight the line gutter when the cursor is on it.
    /// </summary>
    [Parameter] public bool HighlightActiveLineGutter { get; init; } = true;
    /// <summary>
    /// Whether to highlight the active line.
    /// </summary>
    [Parameter] public bool HighlightActiveLine { get; init; } = true;
    /// <summary>
    /// Whether to draw the selection when the editor is focused.
    /// </summary>
    [Parameter] public bool DrawSelection { get; init; } = true;
    /// <summary>
    /// Whether to show a cursor marker when the editor is focused.
    /// </summary>
    [Parameter] public bool DropCursor { get; init; } = true;
    /// <summary>
    /// Whether to enable preview images.
    /// </summary>
    [Parameter] public bool PreviewImages { get; init; } = true;
    /// <summary>
    /// Can the user scroll past the end of the document
    /// </summary>
    [Parameter] public bool ScrollPastEnd { get; init; } = true;
    /// <summary>
    /// Whether to show the markdown control characters around the cursor
    /// </summary>
    [Parameter] public bool ShowMarkdownControlCharactersAroundCursor { get; init; } = true;
    /// <summary>
    /// Additional attributes to be applied to the container element
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)] public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Methods to invoke JS CodeMirror commands.
    /// </summary>
    /// <returns></returns>
    public CMCommandDispatcher? CommandDispatcher => CodeMirror6WrapperInternalRef.CmJsInterop?.CommandDispatcher;

    /// <summary>
    /// State of the CodeMirror6 editor
    /// </summary>
    /// <returns></returns>
    public CodeMirrorState State => CodeMirror6WrapperInternalRef.State;

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
