using CodeMirror6.Models;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace CodeMirror6;

/// <summary>
/// Code-behind for the CodeMirror6Wrapper component
/// </summary>
public partial class CodeMirror6Wrapper : IAsyncDisposable
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
    [Parameter] public bool AutoFormatMarkdownHeaders { get; set; }

    private CodeMirrorJsInterop? CmJsInterop = null;
    private bool hasFocus;
    private bool shouldRender = true;

    public CodeMirrorConfiguration Config = null!;

    /// <summary>
    /// The document contents has changed
    /// </summary>
    /// <param name="value"></param>
    /// <returns></returns>
    [JSInvokable]
    public async Task DocChangedFromJS(string value)
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
    [JSInvokable]
    public async Task FocusChangedFromJS(bool value)
    {
        if (hasFocus == value) return;
        hasFocus = value;
        await FocusChanged.InvokeAsync(hasFocus);
        if (!hasFocus) await SelectionChanged.InvokeAsync(null);
    }

    /// <summary>
    /// The cursor position or selections have changed
    /// </summary>
    /// <param name="value"></param>
    /// <returns></returns>
    [JSInvokable]
    public async Task SelectionSetFromJS(IEnumerable<SelectionRange>? value)
    {
        Selection = value?.ToList();
        await SelectionChanged.InvokeAsync(Selection);
    }

    /*
    [JSInvokable] public async Task<string> UploadFileBlob(string base64, string fileName) => await DoUploadFileBlob(base64, fileName);
    [JSInvokable] public async Task<string> RequestPasteAction(string[] options) => await DoRequestPasteAction(options);
    */

    /// <summary>
    /// Life-cycle method invoked when the component is initialized.
    /// </summary>
    protected override void OnInitialized()
    {
        Config = new CodeMirrorConfiguration(
            Doc,
            Placeholder,
            Theme?.ToString(),
            TabSize,
            IndentationUnit,
            ReadOnly,
            Editable,
            Language?.ToString(),
            AutoFormatMarkdownHeaders
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
                await CmJsInterop.InitCodeMirror();
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
            await CmJsInterop.SetTabSize();
        }
        if (Config.IndentationUnit != IndentationUnit) {
            Config.IndentationUnit = IndentationUnit;
            await CmJsInterop.SetIndentUnit();
        }
        if (Config.Doc?.Replace("\r", "") != Doc?.Replace("\r", "")) {
            Config.Doc = Doc;
            await CmJsInterop.SetDoc();
        }
        if (Config.Placeholder != Placeholder) {
            Config.Placeholder = Placeholder;
            await CmJsInterop.SetPlaceholderText();
        }
        if (Config.ThemeName != Theme?.ToString()) {
            Config.ThemeName = Theme?.ToString();
            await CmJsInterop.SetTheme();
        }
        if (Config.ReadOnly != ReadOnly) {
            Config.ReadOnly = ReadOnly;
            await CmJsInterop.SetReadOnly();
        }
        if (Config.Editable != Editable) {
            Config.Editable = Editable;
            await CmJsInterop.SetEditable();
        }
        if (Config.LanguageName != Language?.ToString()) {
            Config.LanguageName = Language?.ToString();
            await CmJsInterop.SetLanguage();
        }
        if (Config.AutoFormatMarkdownHeaders != AutoFormatMarkdownHeaders) {
            Config.AutoFormatMarkdownHeaders = AutoFormatMarkdownHeaders;
            await CmJsInterop.SetAutoFormatMarkdownHeaders();
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
        GC.SuppressFinalize(this);
    }
}
