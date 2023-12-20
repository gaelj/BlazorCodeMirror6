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
/// <param name="codeMirror"></param>
public class CodeMirrorJsInterop(
    IJSRuntime jsRuntime,
    CodeMirror6Wrapper codeMirror
) : IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask =
        new(() => jsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./_content/CodeMirror6/index.js").AsTask()
        );
    private readonly DotNetObjectReference<CodeMirror6Wrapper> _dotnetHelperRef = DotNetObjectReference.Create(codeMirror);

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
            codeMirror.Id,
            codeMirror.Config
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
            codeMirror.Id,
            codeMirror.TabSize
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
            codeMirror.Id,
            new string(' ', codeMirror.TabSize) // repeat space character by _codeMirror.TabSize
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
            codeMirror.Id,
            codeMirror.Doc?.Replace("\r", "")
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
            codeMirror.Id,
            codeMirror.Placeholder
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
            codeMirror.Id,
            codeMirror.Theme?.ToString()
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
            codeMirror.Id,
            codeMirror.ReadOnly
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
            codeMirror.Id,
            codeMirror.Editable
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
            codeMirror.Id,
            codeMirror.Language?.ToString()
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
            codeMirror.Id,
            codeMirror.AutoFormatMarkdownHeaders
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
