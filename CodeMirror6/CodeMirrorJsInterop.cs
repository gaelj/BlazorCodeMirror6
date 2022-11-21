using Microsoft.JSInterop;

namespace CodeMirror6;

// This class provides an example of how JavaScript functionality can be wrapped
// in a .NET class for easy consumption. The associated JavaScript module is
// loaded on demand when first needed.
//
// This class can be registered as scoped DI service and then injected into Blazor
// components for use.

public class CodeMirrorJsInterop : IAsyncDisposable
{
    private readonly List<Lazy<Task<IJSObjectReference>>> _moduleTasks = new();
    private readonly Lazy<Task<IJSObjectReference>> _mainModuleTask = new();
    private DotNetObjectReference<DotNetHelper> _dotnetHelperRef = null;

    public CodeMirrorJsInterop(IJSRuntime jsRuntime)
    {
        _moduleTasks.Add(new (() => jsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./_content/CodeMirror6/lib/codemirror/codemirror.min.js").AsTask()));
        _mainModuleTask = new (() => jsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./_content/CodeMirror6/bundle/resources.min.js").AsTask());
    }

    public async Task InitCodeMirror(string id)
    {
        if (_dotnetHelperRef == null)
            _dotnetHelperRef = DotNetObjectReference.Create(new DotNetHelper(
                null, // GetText,
                null, // CursorActivity,
                null, // OnFocus,
                null, // OnBlur,
                null, // UploadFileBlob,
                null  // RequestPasteAction
            ));
        if (_dotnetHelperRef == null) return;
        foreach (var moduleTask in _moduleTasks)
            await moduleTask.Value;
        var module = await _mainModuleTask.Value;
        await module.InvokeVoidAsync("initDotNetHelpers", _dotnetHelperRef, id);
        await module.InvokeVoidAsync("initCodeMirror", id);
    }

    public async ValueTask DisposeAsync()
    {
        foreach (var moduleTask in _moduleTasks.Append(_mainModuleTask)) {
            if (moduleTask.IsValueCreated) {
                var module = await moduleTask.Value;
                await module.DisposeAsync();
            }
        }
    }
}
