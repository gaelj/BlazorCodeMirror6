using CodeMirror6.Models;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace CodeMirror6;

/// <summary>
/// Code-behind for the CodeMirror6Wrapper component
/// </summary>
public partial class CodeMirror6Wrapper : ComponentBase, IAsyncDisposable
{
    [Inject] private IJSRuntime JSRuntime { get; set; } = null!;
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
    /// The language to use in the editor
    /// </summary>
    /// <value></value>
    [Parameter] public CodeMirrorLanguage? Language { get; set; } = CodeMirrorLanguage.Markdown;
    /// <summary>
    /// Automatically format (resize) markdown headers
    /// </summary>
    /// <value></value>
    [Parameter] public bool AutoFormatMarkdown { get; set; }
    /// <summary>
    /// Content to be rendered before the editor
    /// </summary>
    /// <value></value>
    [Parameter] public RenderFragment<(CMCommands Commands, CodeMirrorConfiguration Config, CodeMirrorState State)>? ContentBefore { get; set; }
    /// <summary>
    /// Content to be rendered after the editor
    /// </summary>
    /// <value></value>
    [Parameter] public RenderFragment<(CMCommands Commands, CodeMirrorConfiguration Config, CodeMirrorState State)>? ContentAfter { get; set; }
    /// <summary>
    /// The active markdown styles at the current selection(s)
    /// </summary>
    /// <value></value>
    [Parameter] public EventCallback<List<string>> MarkdownStylesAtSelectionsChanged { get; set; }
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
    [Parameter] public Func<string, CancellationToken, Task<List<CodeMirrorDiagnostic>>> LintDocument { get; set; } = (_, _) => Task.FromResult(new List<CodeMirrorDiagnostic>());
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
    /// Additional attributes to be applied to the container element
    /// </summary>
    /// <value></value>
    [Parameter(CaptureUnmatchedValues = true)] public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Methods to invoke JS CodeMirror commands.
    /// </summary>
    /// <returns></returns>
    public CMCommands? Commands => CmJsInterop?.Commands;

    /// <summary>
    /// JavaScript interop instance
    /// </summary>
    internal CodeMirrorJsInterop? CmJsInterop = null;
    internal CodeMirrorConfiguration Config = null!;
    internal CodeMirrorState State = new();

    private bool hasFocus;
    private bool shouldRender = true;
    private string ResizeStyle => AllowVerticalResize && AllowHorizontalResize
        ? "both"
        : AllowVerticalResize ? "vertical"
        : AllowHorizontalResize ? "horizontal"
        : "none";

    /// <summary>
    /// The document contents has changed
    /// </summary>
    /// <param name="value"></param>
    /// <returns></returns>
    [JSInvokable] public async Task DocChangedFromJS(string value)
    {
        if (Doc?.Replace("\r", "") == value?.Replace("\r", "")) return;
        Doc = value?.Replace("\r", "") ?? "";
        Config.Doc = Doc;
        await DocChanged.InvokeAsync(Doc);
    }

    /// <summary>
    /// The document focus has changed
    /// </summary>
    /// <param name="value"></param>
    /// <returns></returns>
    [JSInvokable] public async Task FocusChangedFromJS(bool value)
    {
        if (hasFocus == value) return;
        hasFocus = value;
        await FocusChanged.InvokeAsync(hasFocus);
        if (!hasFocus) await SelectionChanged.InvokeAsync(null);
    }

    /// <summary>
    /// The cursor position or selections have changed
    /// </summary>
    /// <param name="values"></param>
    /// <returns></returns>
    [JSInvokable] public async Task SelectionSetFromJS(IEnumerable<SelectionRange>? values)
    {
        Selection = values?.ToList();
        await SelectionChanged.InvokeAsync(Selection);
    }

    /// <summary>
    /// The active markdown styles at the current selection(s) have changed
    /// </summary>
    /// <param name="values"></param>
    /// <returns></returns>
    [JSInvokable] public async Task MarkdownStyleChangedFromJS(IEnumerable<string>? values)
    {
        State.MarkdownStylesAtSelections = values?.ToList() ?? [];
        await MarkdownStylesAtSelectionsChanged.InvokeAsync(State.MarkdownStylesAtSelections);
    }

    /// <summary>
    /// codeMirror requested linting of the document
    /// </summary>
    /// <param name="code"></param>
    /// <returns></returns>
    [JSInvokable] public async Task<List<CodeMirrorDiagnostic>> LintingRequestedFromJS(string code)
    {
        try {
            LinterCancellationTokenSource.Cancel();
        }
        catch (ObjectDisposedException) {}
        LinterCancellationTokenSource = new();
        var token = LinterCancellationTokenSource.Token;
        try {
            return await LintDocument(code, token);
        }
        catch (OperationCanceledException) {
            return [];
        }
    }

    private CancellationTokenSource LinterCancellationTokenSource = new();

    /*
    [JSInvokable] public async Task<string> UploadFileBlob(string base64, string fileName) => await DoUploadFileBlob(base64, fileName);
    [JSInvokable] public async Task<string> RequestPasteAction(string[] options) => await DoRequestPasteAction(options);
    */

    /// <summary>
    /// Life-cycle method invoked when the component is initialized.
    /// </summary>
    protected override void OnInitialized()
    {
        Config = new(
            Doc,
            Placeholder,
            Theme?.ToString(),
            TabSize,
            IndentationUnit,
            ReadOnly,
            Editable,
            Language?.ToString(),
            AutoFormatMarkdown,
            ReplaceEmojiCodes
        );
    }

    /// <summary>
    /// Life-cycle method invoked when the component is ready to start, having received its initial parameters from its parent in the render tree.
    /// </summary>
    /// <param name="firstRender"></param>
    /// <returns></returns>
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender) {
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
        if (Config.ThemeName != Theme?.ToString()) {
            Config.ThemeName = Theme?.ToString();
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
        if (Config.LanguageName != Language?.ToString()) {
            Config.LanguageName = Language?.ToString();
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
        shouldRender = true;
    }

    /// <summary>
    /// Life-cycle method checking if the component is allowed to render.
    /// </summary>
    /// <returns></returns>
    protected override bool ShouldRender() => shouldRender;

    /// <summary>
    /// Dispose resources
    /// </summary>
    /// <returns></returns>
    public async ValueTask DisposeAsync()
    {
        if (CmJsInterop is not null)
            await CmJsInterop.DisposeAsync();
        try {
            LinterCancellationTokenSource.Cancel();
            LinterCancellationTokenSource.Dispose();
        }
        catch (ObjectDisposedException) {}
        GC.SuppressFinalize(this);
    }
}
