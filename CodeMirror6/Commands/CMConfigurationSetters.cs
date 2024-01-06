using CodeMirror6.Models;
using Microsoft.JSInterop;

namespace CodeMirror6.Commands;

/// <summary>
/// Apply the CodeMirror configuration to the JS CodeMirror instance
/// </summary>
internal class CMSetters(
    DotNetObjectReference<CodeMirror6Wrapper> _dotnetHelperRef,
    CodeMirrorConfiguration config,
    CodeMirrorSetup setup,
    CodeMirror6Wrapper.CodeMirrorJsInterop cmJsInterop
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

    internal Task SetMentionCompletions(List<CodeMirrorCompletion> mentionCompletions) => cmJsInterop.ModuleInvokeVoidAsync(
        "setMentionCompletions",
        mentionCompletions
    );

    internal Task ForceRedraw() => cmJsInterop.ModuleInvokeVoidAsync(
        "forceRedraw"
    );

    internal Task SetResize() => cmJsInterop.ModuleInvokeVoidAsync(
        "setResize",
        config.Resize
    );
}
