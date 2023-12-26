using System.Text.Json.Serialization;
using CodeMirror6.Models;
using Microsoft.JSInterop;

namespace CodeMirror6;

/// <summary>
/// Wraps JavaScript functionality in a .NET class for easy consumption.
/// The associated JavaScript module is loaded on demand when first needed.
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
    internal CMSetters PropertySetters => _setters ??= new(
        _dotnetHelperRef,
        cm6WrapperComponent.Config,
        cm6WrapperComponent.Setup,
        this
    );

    /// <summary>
    /// Methods to invoke JS CodeMirror commands.
    /// </summary>
    /// <returns></returns>
    internal CMCommands Commands => _commands ??= new(this);

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

/// <summary>
/// Built-in parameterless CodeMirror commands
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CodeMirrorSimpleCommand
{
    /// <summary>
    /// Toggle markdown bold formatting around the selected text
    /// </summary>
    ToggleMarkdownBold,

    /// <summary>
    /// Toggle markdown italic formatting around the selected text
    /// </summary>
    ToggleMarkdownItalic,

    /// <summary>
    /// Toggle markdown strikethrough formatting around the selected text
    /// </summary>
    ToggleMarkdownStrikethrough,

    /// <summary>
    /// Toggle markdown code formatting around the selected text
    /// </summary>
    ToggleMarkdownCode,

    /// <summary>
    /// Toggle markdown code block formatting around the selected text
    /// </summary>
    ToggleMarkdownCodeBlock,

    /// <summary>
    /// Toggle markdown quote formatting around the selected text
    /// </summary>
    ToggleMarkdownQuote,

    /// <summary>
    /// Increase markdown header formatting for the selected line
    /// </summary>
    IncreaseMarkdownHeadingLevel,

    /// <summary>
    /// Decrease markdown header formatting for the selected line
    /// </summary>
    DecreaseMarkdownHeadingLevel,

    /// <summary>
    /// Toggle markdown unordered list formatting for the selected line
    /// </summary>
    ToggleMarkdownUnorderedList,

    /// <summary>
    /// Toggle markdown ordered list formatting for the selected line
    /// </summary>
    ToggleMarkdownOrderedList,

    /// <summary>
    /// Toggle markdown task list formatting for the selected line
    /// </summary>
    ToggleMarkdownTaskList,

    /// <summary>
    /// Undo the last change
    /// </summary>
    Undo,

    /// <summary>
    /// Redo the last change
    /// </summary>
    Redo,

    /// <summary>
    /// Undo the last selection change
    /// </summary>
    UndoSelection,

    /// <summary>
    /// Redo the last selection change
    /// </summary>
    RedoSelection,

    /// <summary>
    /// Decreases the indentation level of the selected lines.
    /// </summary>
    IndentLess,

    /// <summary>
    /// Increases the indentation level of the selected lines.
    /// </summary>
    IndentMore,

    /// <summary>
    /// Copies the selected line and inserts it above the current line.
    /// </summary>
    CopyLineUp,

    /// <summary>
    /// Copies the selected line and inserts it below the current line.
    /// </summary>
    CopyLineDown,

    /// <summary>
    /// Indents the selected lines.
    /// </summary>
    IndentSelection,

    /// <summary>
    /// Moves the cursor to the matching bracket.
    /// </summary>
    CursorMatchingBracket,

    /// <summary>
    /// Toggles the comment on the selected lines.
    /// </summary>
    ToggleComment,

    /// <summary>
    /// Toggles the block comment on the selected lines.
    /// </summary>
    ToggleBlockComment,

    /// <summary>
    /// Simplifies the selection by removing leading and trailing whitespace.
    /// </summary>
    SimplifySelection,

    /// <summary>
    /// Inserts a blank line at the current cursor position.
    /// </summary>
    InsertBlankLine,

    /// <summary>
    /// Selects the current line.
    /// </summary>
    SelectLine,

    /// <summary>
    /// Comments out the selected lines as a block.
    /// </summary>
    BlockComment,

    /// <summary>
    /// Uncomments the selected lines as a block.
    /// </summary>
    BlockUncomment,

    /// <summary>
    /// Toggles the block comment on each line of the selection.
    /// </summary>
    ToggleBlockCommentByLine,

    /// <summary>
    /// Comments out the current line.
    /// </summary>
    LineComment,

    /// <summary>
    /// Uncomments the current line.
    /// </summary>
    LineUncomment,

    /// <summary>
    /// Toggles the comment on the current line.
    /// </summary>
    ToggleLineComment,

    /// <summary>
    /// Focus the CodeMirror editor
    /// </summary>
    Focus,
}

/// <summary>
/// Built-in CodeMirror commands expecting 1 parameter
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CodeMirrorCommandOneParameter
{
    /// <summary>
    /// Toggle markdown header formatting for the selected line
    /// </summary>
    ToggleMarkdownHeading,

    /// <summary>
    /// Insert at selection or replace selected text
    /// </summary>
    InsertOrReplaceText,

    /// <summary>
    /// Insert text above the selected text's line
    /// </summary>
    InsertTextAbove,
}

internal class CMSetters(
    DotNetObjectReference<CodeMirror6Wrapper> _dotnetHelperRef,
    CodeMirrorConfiguration config,
    CodeMirrorSetup setup,
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
        config,
        setup
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
    public Task SetAutoFormatMarkdown() => cmJsInterop.ModuleInvokeVoidAsync(
        "setAutoFormatMarkdown",
        config.AutoFormatMarkdown
    );

    public Task SetReplaceEmojiCodes() => cmJsInterop.ModuleInvokeVoidAsync(
        "setReplaceEmojiCodes",
        config.ReplaceEmojiCodes
    );
}

/// <summary>
/// Invoke JS CodeMirror commands
/// </summary>
public class CMCommands(CodeMirrorJsInterop cmJsInterop)
{
    /// <summary>
    /// Invoke a built-in CodeMirror command
    /// </summary>
    /// <param name="command"></param>
    /// <returns></returns>
    public Task Dispatch(CodeMirrorSimpleCommand command) => cmJsInterop.ModuleInvokeVoidAsync("dispatchCommand", command);

    /// <summary>
    /// Invoke a built-in CodeMirror command with one parameter
    /// </summary>
    /// <param name="command"></param>
    /// <param name="value"></param>
    /// <returns></returns>
    public Task Dispatch<TCommandEnum, TValue>(TCommandEnum command, TValue value) => cmJsInterop.ModuleInvokeVoidAsync("dispatchCommand", command, value);
}
