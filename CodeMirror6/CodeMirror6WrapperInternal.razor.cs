using System.Collections.ObjectModel;
using GaelJ.BlazorCodeMirror6.Models;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.JSInterop;

namespace GaelJ.BlazorCodeMirror6;

/// <summary>
/// Code-behind for the CodeMirror6WrapperInternal component
/// </summary>
public partial class CodeMirror6WrapperInternal : ComponentBase, IAsyncDisposable
{
    [Inject] private IJSRuntime JSRuntime { get; set; } = null!;
    [Inject] private ILogger<CodeMirror6WrapperInternal> Logger { get; set; } = null!;

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
    /// Upload a file to a server and return the URL to the file
    /// </summary>
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
    /// Additional attributes to be applied to the container element
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)] public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Methods to invoke JS CodeMirror commands.
    /// </summary>
    /// <returns></returns>
    public CMCommandDispatcher? CommandDispatcher => CmJsInterop?.CommandDispatcher;

    private string LoadingDivId => $"{Setup.Id}_Loading";
    private string ResizeStyle => AllowVerticalResize && AllowHorizontalResize
        ? "both"
        : AllowVerticalResize ? "vertical"
        : AllowHorizontalResize ? "horizontal"
        : "none";
    private string VisibleClass => Visible ? string.Empty : " d-none ";

    /// <summary>
    /// JavaScript interop instance
    /// </summary>
    internal CodeMirrorJsInterop? CmJsInterop = null;
    internal CodeMirrorConfiguration Config = null!;
    private bool shouldRender = true;

    /// <summary>
    /// Life-cycle method invoked when the component is initialized.
    /// </summary>
    protected override async Task OnInitializedAsync()
    {
        Config = new(
            Doc,
            Placeholder,
            Theme,
            TabSize,
            IndentationUnit,
            ReadOnly,
            Editable,
            Language,
            AutoFormatMarkdown,
            ReplaceEmojiCodes,
            ResizeStyle,
            LineWrapping,
            LintDocument is not null,
            MergeViewConfiguration,
            FileNameOrExtension,
            HighlightTrailingWhitespace,
            HighlightWhitespace
        );
        try {
            if (IsWASM)
                await InitializeJsInterop();
        }
        catch (Exception) {
        }
    }

    /// <summary>
    /// Life-cycle method invoked when the component is ready to start, having received its initial parameters from its parent in the render tree.
    /// </summary>
    /// <param name="firstRender"></param>
    /// <returns></returns>
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender) {
            if (!IsWASM)
                await InitializeJsInterop();
        }
    }

    private async Task InitializeJsInterop()
    {
        if (CmJsInterop is null) {
            CmJsInterop = new CodeMirrorJsInterop(JSRuntime, this);
            await CmJsInterop.PropertySetters.InitCodeMirror();
            if (GetMentionCompletions is not null) {
                var mentionCompletions = await GetMentionCompletions();
                await CmJsInterop.PropertySetters.SetMentionCompletions(mentionCompletions);
            }
            await InvokeAsync(StateHasChanged);
        }
    }

    /// <summary>
    /// Life-cycle method invoked when the component has received parameters from its parent in the render tree.
    /// </summary>
    /// <returns></returns>
    protected override async Task OnParametersSetAsync()
    {
        shouldRender = true;
        if (CmJsInterop is null) return;
        shouldRender = false;
        try {
            if (Config.TabSize != TabSize) {
                Config.TabSize = TabSize;
                await CmJsInterop.PropertySetters.SetTabSize();
            }
            if (Config.IndentationUnit != IndentationUnit) {
                Config.IndentationUnit = IndentationUnit;
                await CmJsInterop.PropertySetters.SetIndentUnit();
            }
            if (Config.Doc?.Replace("\r", "") != Doc?.Replace("\r", "")) {
                Config.Doc = Doc;
                await CmJsInterop.PropertySetters.SetDoc();
            }
            if (Config.Placeholder != Placeholder) {
                Config.Placeholder = Placeholder;
                await CmJsInterop.PropertySetters.SetPlaceholderText();
            }
            if (Config.ThemeName != Theme) {
                Config.ThemeName = Theme;
                await CmJsInterop.PropertySetters.SetTheme();
            }
            if (Config.ReadOnly != ReadOnly) {
                Config.ReadOnly = ReadOnly;
                await CmJsInterop.PropertySetters.SetReadOnly();
            }
            if (Config.Editable != Editable) {
                Config.Editable = Editable;
                await CmJsInterop.PropertySetters.SetEditable();
            }
            if (Config.LanguageName != Language) {
                Config.LanguageName = Language;
                await CmJsInterop.PropertySetters.SetLanguage();
            }
            if (Config.FileNameOrExtension != FileNameOrExtension) {
                Config.FileNameOrExtension = FileNameOrExtension;
                await CmJsInterop.PropertySetters.SetLanguage();
            }
            if (Config.AutoFormatMarkdown != AutoFormatMarkdown) {
                Config.AutoFormatMarkdown = AutoFormatMarkdown;
                await CmJsInterop.PropertySetters.SetAutoFormatMarkdown();
            }
            if (Config.ReplaceEmojiCodes != ReplaceEmojiCodes) {
                Config.ReplaceEmojiCodes = ReplaceEmojiCodes;
                await CmJsInterop.PropertySetters.SetReplaceEmojiCodes();
            }
            if (Config.Resize != ResizeStyle) {
                Config.Resize = ResizeStyle;
                await CmJsInterop.PropertySetters.SetResize();
            }
            if (Config.LineWrapping != LineWrapping) {
                Config.LineWrapping = LineWrapping;
                await CmJsInterop.PropertySetters.SetLineWrapping();
            }
            if (Config.MergeViewConfiguration != MergeViewConfiguration) {
                Config.MergeViewConfiguration = MergeViewConfiguration;
                await CmJsInterop.PropertySetters.SetUnifiedMergeView();
            }
            if (Config.HighlightTrailingWhitespace != HighlightTrailingWhitespace) {
                Config.HighlightTrailingWhitespace = HighlightTrailingWhitespace;
                await CmJsInterop.PropertySetters.SetHighlightTrailingWhitespace();
            }
            if (Config.HighlightWhitespace != HighlightWhitespace) {
                Config.HighlightWhitespace = HighlightWhitespace;
                await CmJsInterop.PropertySetters.SetHighlightWhitespace();
            }
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error setting CodeMirror6 properties");
        }
        finally {
            shouldRender = true;
        }
    }

    /// <summary>
    /// Life-cycle method checking if the component is allowed to render.
    /// </summary>
    /// <returns></returns>
    protected override bool ShouldRender() => shouldRender;
    /// <summary>
    /// Is the JS CodeMirror instance ready?
    /// </summary>
    public bool IsLoaded => CmJsInterop?.IsJSReady == true;

    /// <summary>
    /// Dispose resources
    /// </summary>
    /// <returns></returns>
    public async ValueTask DisposeAsync()
    {
        if (CmJsInterop?.IsJSReady == true)
            await CmJsInterop.DisposeAsync();
        CmJsInterop = null;
        try {
            LinterCancellationTokenSource.Cancel();
            LinterCancellationTokenSource.Dispose();
        }
        catch (ObjectDisposedException) {}
        GC.SuppressFinalize(this);
    }
}
