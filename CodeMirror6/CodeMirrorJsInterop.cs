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

    /// <summary>
    /// Call the Javascript initialization
    /// </summary>
    /// <returns></returns>
    public async Task InitCodeMirror()
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        await module.InvokeVoidAsync(
            "initCodeMirror",
            _dotnetHelperRef,
            cm6WrapperComponent.Id,
            cm6WrapperComponent.Config
        );
    }

    /// <summary>
    /// Modify the indentation tab size
    /// </summary>
    /// <returns></returns>
    public async Task SetTabSize()
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        await module.InvokeVoidAsync(
            "setTabSize",
            cm6WrapperComponent.Id,
            cm6WrapperComponent.TabSize
        );
    }

    /// <summary>
    /// Modify the indentation unit
    /// </summary>
    /// <returns></returns>
    public async Task SetIndentUnit()
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        await module.InvokeVoidAsync(
            "setIndentUnit",
            cm6WrapperComponent.Id,
            new string(' ', cm6WrapperComponent.TabSize) // repeat space character by _codeMirror.TabSize
        );
    }

    /// <summary>
    /// Modify the text
    /// </summary>
    /// <returns></returns>
    public async Task SetDoc()
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        await module.InvokeVoidAsync(
            "setDoc",
            cm6WrapperComponent.Id,
            cm6WrapperComponent.Doc?.Replace("\r", "")
        );
    }

    /// <summary>
    /// Set the placeholder text
    /// </summary>
    /// <returns></returns>
    public async Task SetPlaceholderText()
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        await module.InvokeVoidAsync(
            "setPlaceholderText",
            cm6WrapperComponent.Id,
            cm6WrapperComponent.Placeholder
        );
    }

    /// <summary>
    /// Set the theme
    /// </summary>
    /// <returns></returns>
    public async Task SetTheme()
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        await module.InvokeVoidAsync(
            "setTheme",
            cm6WrapperComponent.Id,
            cm6WrapperComponent.Theme?.ToString()
        );
    }

    /// <summary>
    /// Set the read-only state
    /// </summary>
    /// <returns></returns>
    public async Task SetReadOnly()
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        await module.InvokeVoidAsync(
            "setReadOnly",
            cm6WrapperComponent.Id,
            cm6WrapperComponent.ReadOnly
        );
    }

    /// <summary>
    /// Set the editable state
    /// </summary>
    /// <returns></returns>
    public async Task SetEditable()
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        await module.InvokeVoidAsync(
            "setEditable",
            cm6WrapperComponent.Id,
            cm6WrapperComponent.Editable
        );
    }

    /// <summary>
    /// Set the language
    /// </summary>
    public async Task SetLanguage()
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        await module.InvokeVoidAsync(
            "setLanguage",
            cm6WrapperComponent.Id,
            cm6WrapperComponent.Language?.ToString()
        );
    }

    /// <summary>
    /// Set the auto format markdown headers state
    /// </summary>
    /// <returns></returns>
    public async Task SetAutoFormatMarkdownHeaders()
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        await module.InvokeVoidAsync(
            "setAutoFormatMarkdownHeaders",
            cm6WrapperComponent.Id,
            cm6WrapperComponent.AutoFormatMarkdownHeaders
        );
    }

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
