using CodeMirror6.Models;
using Microsoft.JSInterop;

namespace CodeMirror6;

/// <summary>
/// DotNet interop from Javascript
/// </summary>
public class DotNetHelper
{
    /// <summary>
    /// Instantiate the function callbacks
    /// </summary>
    /// <param name="codeMirror"></param>
    public DotNetHelper(CodeMirror6Wrapper codeMirror)
    {
        this.codeMirror = codeMirror;
    }

    private CodeMirror6Wrapper codeMirror;

    /// <summary>
    /// The document contents has changed
    /// </summary>
    /// <param name="text"></param>
    /// <returns></returns>
    [JSInvokable]
    public async Task DocChanged(string text) => await codeMirror.DocChanged(text);

    /// <summary>
    /// The document focus has changed
    /// </summary>
    /// <param name="hasFocus"></param>
    /// <returns></returns>
    [JSInvokable]
    public async Task FocusChanged(bool hasFocus) => await codeMirror.FocusChanged(hasFocus);


    [JSInvokable]
    public async Task SelectionSet(IEnumerable<SelectionRange> ranges) => await codeMirror.SelectionSet(ranges?.ToList());
    /* 
    [JSInvokable] public async Task CursorActivity() => await DoCursorActivity();
    [JSInvokable] public async Task OnFocus() => await DoOnFocus();
    [JSInvokable] public async Task OnBlur() => await DoOnBlur();
    [JSInvokable] public async Task<string> UploadFileBlob(string base64, string fileName) => await DoUploadFileBlob(base64, fileName);
    [JSInvokable] public async Task<string> RequestPasteAction(string[] options) => await DoRequestPasteAction(options); */
}
