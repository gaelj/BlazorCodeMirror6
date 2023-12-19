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
            _codeMirror.Text,
            _codeMirror.PlaceholderText,
            _codeMirror.TabSize
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
    public async Task SetText()
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        await module.InvokeVoidAsync(
            "setText",
            _codeMirror.Id,
            _codeMirror.Text?.Replace("\r", "")
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
            _codeMirror.PlaceholderText
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
