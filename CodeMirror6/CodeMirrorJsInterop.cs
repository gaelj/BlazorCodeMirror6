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
    private CMSetters _setters = null!;
    private CMCommands _commands = null!;

    internal async Task ModuleInvokeVoidAsync(string method, params object?[] args)
    {
        var module = await _moduleTask.Value;
        if (module is null) return;
        args = args.Prepend(cm6WrapperComponent.Id).ToArray();
        await module.InvokeVoidAsync(method, args);
    }

    /// <summary>
    /// Methods to set JS CodeMirror properties to reflect the values of the blazor wrapper parameters. Internal use only.
    /// </summary>
    /// <returns></returns>
    internal CMSetters PropertySetters => _setters ??= new(_dotnetHelperRef, cm6WrapperComponent.Config, this);
    /// <summary>
    /// Methods to invoke JS CodeMirror commands.
    /// </summary>
    /// <returns></returns>
    public CMCommands Commands => _commands ??= new(this);

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

internal class CMSetters(
    DotNetObjectReference<CodeMirror6Wrapper> _dotnetHelperRef,
    CodeMirrorConfiguration config,
    CodeMirrorJsInterop cmJsInterop
)
{
    /// <summary>
    /// Call the Javascript initialization
    /// </summary>
    /// <returns></returns>
    public Task InitCodeMirror() => cmJsInterop.ModuleInvokeVoidAsync(
        "initCodeMirror",
        _dotnetHelperRef,
        config
    );

    /// <summary>
    /// Modify the indentation tab size
    /// </summary>
    /// <returns></returns>
    public Task SetTabSize() => cmJsInterop.ModuleInvokeVoidAsync(
        "setTabSize",
        config.TabSize
    );

    /// <summary>
    /// Modify the indentation unit
    /// </summary>
    /// <returns></returns>
    public Task SetIndentUnit() => cmJsInterop.ModuleInvokeVoidAsync(
        "setIndentUnit",
        new string(' ', config.TabSize) // repeat space character by _codeMirror.TabSize
    );

    /// <summary>
    /// Modify the text
    /// </summary>
    /// <returns></returns>
    public Task SetDoc() => cmJsInterop.ModuleInvokeVoidAsync(
        "setDoc",
        config.Doc?.Replace("\r", "")
    );

    /// <summary>
    /// Set the placeholder text
    /// </summary>
    /// <returns></returns>
    public Task SetPlaceholderText() => cmJsInterop.ModuleInvokeVoidAsync(
        "setPlaceholderText",
        config.Placeholder
    );

    /// <summary>
    /// Set the theme
    /// </summary>
    /// <returns></returns>
    public Task SetTheme() => cmJsInterop.ModuleInvokeVoidAsync(
        "setTheme",
        config.ThemeName
    );

    /// <summary>
    /// Set the read-only state
    /// </summary>
    /// <returns></returns>
    public Task SetReadOnly() => cmJsInterop.ModuleInvokeVoidAsync(
        "setReadOnly",
        config.ReadOnly
    );

    /// <summary>
    /// Set the editable state
    /// </summary>
    /// <returns></returns>
    public Task SetEditable() => cmJsInterop.ModuleInvokeVoidAsync(
        "setEditable",
        config.Editable
    );

    /// <summary>
    /// Set the language
    /// </summary>
    public Task SetLanguage() => cmJsInterop.ModuleInvokeVoidAsync(
        "setLanguage",
        config.LanguageName
    );

    /// <summary>
    /// Set the auto format markdown headers state
    /// </summary>
    /// <returns></returns>
    public Task SetAutoFormatMarkdownHeaders() => cmJsInterop.ModuleInvokeVoidAsync(
        "setAutoFormatMarkdownHeaders",
        config.AutoFormatMarkdownHeaders
    );
}

/// <summary>
/// Invoke JS CodeMirror commands
/// </summary>
public class CMCommands(CodeMirrorJsInterop cmJsInterop)
{
    /// <summary>
    /// Toggle markdown bold formatting around the selected text
    /// </summary>
    /// <returns></returns>
    public Task ToggleMarkdownBold() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownBold");
    /// <summary>
    /// Toggle markdown italic formatting around the selected text
    /// </summary>
    /// <returns></returns>
    public Task ToggleMarkdownItalic() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownItalic");
    /// <summary>
    /// Toggle markdown strikethrough formatting around the selected text
    /// </summary>
    /// <returns></returns>
    public Task ToggleMarkdownStrikethrough() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownStrikethrough");
    /// <summary>
    /// Toggle markdown code formatting around the selected text
    /// </summary>
    /// <returns></returns>
    public Task ToggleMarkdownCode() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownCode");
    /// <summary>
    /// Toggle markdown code block formatting around the selected text
    /// </summary>
    /// <returns></returns>
    public Task ToggleMarkdownCodeBlock() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownCodeBlock");
    public Task ToggleMarkdownQuote() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownQuote");
    public Task ToggleMarkdownHeading1() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownHeading1");
    public Task ToggleMarkdownHeading2() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownHeading2");
    public Task ToggleMarkdownHeading3() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownHeading3");
    public Task ToggleMarkdownHeading4() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownHeading4");
    public Task ToggleMarkdownHeading5() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownHeading5");
    public Task ToggleMarkdownHeading6() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownHeading6");
    public Task ToggleMarkdownUnorderedList() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownUnorderedList");
    public Task ToggleMarkdownOrderedList() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownOrderedList");
    public Task ToggleMarkdownTaskList() => cmJsInterop.ModuleInvokeVoidAsync("toggleMarkdownTaskList");

    /// <summary>
    /// Undo the last change
    /// </summary>
    /// <returns></returns>
    public Task PerformUndo() => cmJsInterop.ModuleInvokeVoidAsync("performUndo");
    /// <summary>
    /// Redo the last change
    /// </summary>
    /// <returns></returns>
    public Task PerformRedo() => cmJsInterop.ModuleInvokeVoidAsync("performRedo");
    /// <summary>
    /// Undo the last selection change
    /// </summary>
    /// <returns></returns>
    public Task PerformUndoSelection() => cmJsInterop.ModuleInvokeVoidAsync("performUndoSelection");
    /// <summary>
    /// Redo the last selection change
    /// </summary>
    /// <returns></returns>
    public Task PerformRedoSelection() => cmJsInterop.ModuleInvokeVoidAsync("performRedoSelection");
}
