namespace GaelJ.BlazorCodeMirror6.Models;

/// <summary>
/// Invoke JS CodeMirror commands
/// </summary>
public class CMCommandDispatcher
{
    private readonly CodeMirror6WrapperInternal.CodeMirrorJsInterop cmJsInterop;

    internal CMCommandDispatcher(CodeMirror6WrapperInternal.CodeMirrorJsInterop cmJsInterop) => this.cmJsInterop = cmJsInterop;

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

    /// <summary>
    /// Invoke a built-in CodeMirror command with two parameters
    /// </summary>
    /// <param name="command"></param>
    /// <param name="value1"></param>
    /// <param name="value2"></param>
    /// <returns></returns>
    public Task Dispatch<TValue1, TValue2>(CodeMirrorCommandTwoParameters command, TValue1 value1, TValue2 value2) => cmJsInterop.ModuleInvokeVoidAsync("dispatchCommand", command, value1, value2);
}
