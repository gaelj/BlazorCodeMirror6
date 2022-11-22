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
    private DotNetObjectReference<DotNetHelper>? _dotnetHelperRef = null;

    /// <summary>
    /// Loads the Javascript modules
    /// </summary>
    /// <param name="jsRuntime"></param>
    public CodeMirrorJsInterop(IJSRuntime jsRuntime)
    {
        _moduleTask = new (() => jsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./_content/CodeMirror6/index.js").AsTask());
    }

    /// <summary>
    /// Call the Javascript initialization
    /// </summary>
    /// <param name="id"></param>
    /// <param name="setText"></param>
    /// <returns></returns>
    public async Task InitCodeMirror(string id, Func<string, Task> setText)
    {
        if (_dotnetHelperRef == null)
            _dotnetHelperRef = DotNetObjectReference.Create(new DotNetHelper(
                setText,
                null, // CursorActivity,
                null, // OnFocus,
                null, // OnBlur,
                null, // UploadFileBlob,
                null  // RequestPasteAction
            ));
        if (_dotnetHelperRef == null) return;
        var module = await _moduleTask.Value;
        if (module == null) return;
        await module.InvokeVoidAsync("initDotNetHelpers", _dotnetHelperRef, id);
        await module.InvokeVoidAsync("initCodeMirror", id);
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
    }
}
