using CodeMirror6.Models;
using Microsoft.JSInterop;

namespace CodeMirror6;

/// <summary>
/// Wraps JavaScript functionality in a .NET class for easy consumption.
/// The associated JavaScript module is loaded on demand when first needed.
///
/// This class can be registered as scoped DI service and then injected into Blazor
/// components for use.
/// </summary>
public class CodeMirrorJsInterop : IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask = new();
    private DotNetObjectReference<CodeMirror6Wrapper>? _dotnetHelperRef = null;
    private readonly CodeMirror6Wrapper _codeMirror;

    /// <summary>
    /// Loads the Javascript modules
    /// </summary>
    /// <param name="jsRuntime"></param>
    /// <param name="codeMirror"></param>
    public CodeMirrorJsInterop(IJSRuntime jsRuntime, CodeMirror6Wrapper codeMirror)
    {
        _codeMirror = codeMirror;
        _moduleTask = new (() => jsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./_content/CodeMirror6/index.js").AsTask()
        );
    }

    /// <summary>
    /// Call the Javascript initialization
    /// </summary>
    /// <returns></returns>
    public async Task InitCodeMirror()
    {
        _dotnetHelperRef ??= DotNetObjectReference.Create(_codeMirror);
        if (_dotnetHelperRef is null) return;
        var module = await _moduleTask.Value;
        if (module is null) return;
        await module.InvokeVoidAsync(
            "initCodeMirror",
            _dotnetHelperRef,
            _codeMirror.Id,
            _codeMirror.Config
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
            _codeMirror.Id,
            _codeMirror.TabSize
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
            _codeMirror.Id,
            new string(' ', _codeMirror.TabSize) // repeat space character by _codeMirror.TabSize
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
            _codeMirror.Id,
            _codeMirror.Doc?.Replace("\r", "")
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
            _codeMirror.Id,
            _codeMirror.Placeholder
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
            _codeMirror.Id,
            _codeMirror.Theme?.ToString()
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
            _codeMirror.Id,
            _codeMirror.ReadOnly
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
            _codeMirror.Id,
            _codeMirror.Editable
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
            _codeMirror.Id,
            _codeMirror.Language?.ToString()
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
