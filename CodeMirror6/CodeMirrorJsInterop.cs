using Microsoft.JSInterop;

namespace CodeMirror6;

/// <summary>
/// Wraps JavaScript functionality in a .NET class for easy consumption.
/// The associated JavaScript module is loaded on demand when first needed.
///
/// This class can be registered as scoped DI service and then injected into Blazor
/// components for use.
/// </summary>
/// <remarks>
/// Loads the Javascript modules
/// </remarks>
/// <param name="jsRuntime"></param>
/// <param name="cm6WrapperComponent"></param>
public class CodeMirrorJsInterop(
    IJSRuntime jsRuntime,
    CodeMirror6Wrapper cm6WrapperComponent
) : IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask =
        new(() => jsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./_content/CodeMirror6/index.js").AsTask()
        );
    private readonly DotNetObjectReference<CodeMirror6Wrapper> _dotnetHelperRef = DotNetObjectReference.Create(cm6WrapperComponent);

    private async Task ModuleInvokeVoidAsync(string method, params object?[] args)
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        args = args.Prepend(cm6WrapperComponent.Id).ToArray();
        await module.InvokeVoidAsync(method, args);
    }

    /// <summary>
    /// Call the Javascript initialization
    /// </summary>
    /// <returns></returns>
    public Task InitCodeMirror() => ModuleInvokeVoidAsync(
        "initCodeMirror",
        _dotnetHelperRef,
        cm6WrapperComponent.Config
    );

    /// <summary>
    /// Modify the indentation tab size
    /// </summary>
    /// <returns></returns>
    public Task SetTabSize() => ModuleInvokeVoidAsync(
        "setTabSize",
        cm6WrapperComponent.TabSize
    );

    /// <summary>
    /// Modify the indentation unit
    /// </summary>
    /// <returns></returns>
    public Task SetIndentUnit() => ModuleInvokeVoidAsync(
        "setIndentUnit",
        new string(' ', cm6WrapperComponent.TabSize) // repeat space character by _codeMirror.TabSize
    );

    /// <summary>
    /// Modify the text
    /// </summary>
    /// <returns></returns>
    public Task SetDoc() => ModuleInvokeVoidAsync(
        "setDoc",
        cm6WrapperComponent.Doc?.Replace("\r", "")
    );

    /// <summary>
    /// Set the placeholder text
    /// </summary>
    /// <returns></returns>
    public Task SetPlaceholderText() => ModuleInvokeVoidAsync(
        "setPlaceholderText",
        cm6WrapperComponent.Placeholder
    );

    /// <summary>
    /// Set the theme
    /// </summary>
    /// <returns></returns>
    public Task SetTheme() => ModuleInvokeVoidAsync(
        "setTheme",
        cm6WrapperComponent.Theme?.ToString()
    );

    /// <summary>
    /// Set the read-only state
    /// </summary>
    /// <returns></returns>
    public Task SetReadOnly() => ModuleInvokeVoidAsync(
        "setReadOnly",
        cm6WrapperComponent.ReadOnly
    );

    /// <summary>
    /// Set the editable state
    /// </summary>
    /// <returns></returns>
    public Task SetEditable() => ModuleInvokeVoidAsync(
        "setEditable",
        cm6WrapperComponent.Editable
    );

    /// <summary>
    /// Set the language
    /// </summary>
    public Task SetLanguage() => ModuleInvokeVoidAsync(
        "setLanguage",
        cm6WrapperComponent.Language?.ToString()
    );

    /// <summary>
    /// Set the auto format markdown headers state
    /// </summary>
    /// <returns></returns>
    public Task SetAutoFormatMarkdownHeaders() => ModuleInvokeVoidAsync(
        "setAutoFormatMarkdownHeaders",
        cm6WrapperComponent.AutoFormatMarkdownHeaders
    );

    /// <summary>
    /// Toggle markdown bold formatting around the selected text
    /// </summary>
    /// <returns></returns>
    public Task ToggleMarkdownBold() => ModuleInvokeVoidAsync("toggleMarkdownBold");

    /// <summary>
    /// Toggle markdown italic formatting around the selected text
    /// </summary>
    /// <returns></returns>
    public Task ToggleMarkdownItalic() => ModuleInvokeVoidAsync("toggleMarkdownItalic");
    /// <summary>
    /// Toggle markdown strikethrough formatting around the selected text
    /// </summary>
    /// <returns></returns>
    public Task ToggleMarkdownStrikethrough() => ModuleInvokeVoidAsync("toggleMarkdownStrikethrough");
    /// <summary>
    /// Toggle markdown code formatting around the selected text
    /// </summary>
    /// <returns></returns>
    public Task ToggleMarkdownCode() => ModuleInvokeVoidAsync("toggleMarkdownCode");
    /// <summary>
    /// Toggle markdown code block formatting around the selected text
    /// </summary>
    /// <returns></returns>
    public Task ToggleMarkdownCodeBlock() => ModuleInvokeVoidAsync("toggleMarkdownCodeBlock");
    /// <summary>
    /// Undo the last change
    /// </summary>
    /// <returns></returns>
    public Task PerformUndo() => ModuleInvokeVoidAsync("performUndo");
    /// <summary>
    /// Redo the last change
    /// </summary>
    /// <returns></returns>
    public Task PerformRedo() => ModuleInvokeVoidAsync("performRedo");
    /// <summary>
    /// Undo the last selection change
    /// </summary>
    /// <returns></returns>
    public Task PerformUndoSelection() => ModuleInvokeVoidAsync("performUndoSelection");
    /// <summary>
    /// Redo the last selection change
    /// </summary>
    /// <returns></returns>
    public Task PerformRedoSelection() => ModuleInvokeVoidAsync("performRedoSelection");

    /// <summary>
    /// Dispose Javascript modules
    /// </summary>
    /// <returns></returns>
    public async ValueTask DisposeAsync()
    {
        if (_moduleTask.IsValueCreated) {
            var module = await _moduleTask.Value;
            await module.DisposeAsync();
        }
        GC.SuppressFinalize(this);
    }
}
