using CodeMirror6.Commands;

namespace CodeMirror6.Models;

/// <summary>
/// Invoke JS CodeMirror commands
/// </summary>
public class CMCommandDispatcher
{
    private readonly CodeMirror6Wrapper.CodeMirrorJsInterop cmJsInterop;

    internal CMCommandDispatcher(CodeMirror6Wrapper.CodeMirrorJsInterop cmJsInterop) => this.cmJsInterop = cmJsInterop;

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
    public Task Dispatch<TValue>(CodeMirrorCommandOneParameter command, TValue value) => cmJsInterop.ModuleInvokeVoidAsync("dispatchCommand", command, value);
}
