using GaelJ.BlazorCodeMirror6.Models;
using Microsoft.JSInterop;

namespace GaelJ.BlazorCodeMirror6.Commands;

/// <summary>
/// Apply the CodeMirror configuration to the JS CodeMirror instance
/// </summary>
internal class CMSetters(
    DotNetObjectReference<CodeMirror6WrapperInternal> _dotnetHelperRef,
    CodeMirrorConfiguration config,
    CodeMirrorSetup setup,
    CodeMirror6WrapperInternal.CodeMirrorJsInterop cmJsInterop
)
{
    /// <summary>
    /// Call the Javascript initialization
    /// </summary>
    /// <returns></returns>
    internal Task InitCodeMirror() => cmJsInterop.ModuleInvokeVoidAsync(
        "initCodeMirror",
        _dotnetHelperRef,
        config,
        setup
    );

    /// <summary>
    /// Modify the indentation tab size
    /// </summary>
    /// <returns></returns>
    internal Task SetTabSize() => cmJsInterop.ModuleInvokeVoidAsync(
        "setTabSize",
        config.TabSize
    );

    /// <summary>
    /// Modify the indentation unit
    /// </summary>
    /// <returns></returns>
    internal Task SetIndentUnit() => cmJsInterop.ModuleInvokeVoidAsync(
        "setIndentUnit",
        new string(' ', config.TabSize) // repeat space character by _codeMirror.TabSize
    );

    /// <summary>
    /// Modify the text
    /// </summary>
    /// <returns></returns>
    internal Task SetDoc() => cmJsInterop.ModuleInvokeVoidAsync(
        "setDoc",
        config.Doc?.Replace("\r", "")
    );

    /// <summary>
    /// Set the placeholder text
    /// </summary>
    /// <returns></returns>
    internal Task SetPlaceholderText() => cmJsInterop.ModuleInvokeVoidAsync(
        "setPlaceholderText",
        config.Placeholder
    );

    /// <summary>
    /// Set the theme
    /// </summary>
    /// <returns></returns>
    internal Task SetTheme() => cmJsInterop.ModuleInvokeVoidAsync(
        "setTheme",
        config.ThemeName
    );

    /// <summary>
    /// Set the read-only state
    /// </summary>
    /// <returns></returns>
    internal Task SetReadOnly() => cmJsInterop.ModuleInvokeVoidAsync(
        "setReadOnly",
        config.ReadOnly
    );

    /// <summary>
    /// Set the editable state
    /// </summary>
    /// <returns></returns>
    internal Task SetEditable() => cmJsInterop.ModuleInvokeVoidAsync(
        "setEditable",
        config.Editable
    );

    /// <summary>
    /// Set the language
    /// </summary>
    internal Task SetLanguage() => cmJsInterop.ModuleInvokeVoidAsync(
        "setLanguage",
        config.LanguageName,
        config.FileNameOrExtension
    );

    /// <summary>
    /// Set the auto format markdown headers state
    /// </summary>
    /// <returns></returns>
    internal Task SetAutoFormatMarkdown() => cmJsInterop.ModuleInvokeVoidAsync(
        "setAutoFormatMarkdown",
        config.AutoFormatMarkdown
    );

    internal Task SetReplaceEmojiCodes() => cmJsInterop.ModuleInvokeVoidAsync(
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

    internal Task SetLineWrapping() => cmJsInterop.ModuleInvokeVoidAsync(
        "setLineWrapping",
        config.LineWrapping
    );

    internal Task SetUnifiedMergeView() => cmJsInterop.ModuleInvokeVoidAsync(
        "setUnifiedMergeView",
        config.MergeViewConfiguration
    );

    internal Task<List<string>?> GetAllSupportedLanguageNames() => cmJsInterop.ModuleInvokeAsync<List<string>>(
        "getAllSupportedLanguageNames"
    );
}
