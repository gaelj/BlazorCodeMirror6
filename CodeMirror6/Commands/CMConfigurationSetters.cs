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
    internal Task<bool> InitCodeMirror() => cmJsInterop.ModuleInvokeVoidAsync(
        "initCodeMirror",
        _dotnetHelperRef,
        config,
        setup
    );

    internal Task<bool> SetMentionCompletions(List<CodeMirrorCompletion> mentionCompletions) => cmJsInterop.ModuleInvokeVoidAsync(
        "setMentionCompletions",
        mentionCompletions
    );

    internal Task<bool> ForceRedraw() => cmJsInterop.ModuleInvokeVoidAsync(
        "forceRedraw"
    );

    internal Task<List<string>?> GetAllSupportedLanguageNames() => cmJsInterop.ModuleInvokeAsync<List<string>>(
        "getAllSupportedLanguageNames"
    );

    internal Task<bool> SetConfiguration() => cmJsInterop.ModuleInvokeVoidAsync(
        "setConfiguration",
        config
    );
}
