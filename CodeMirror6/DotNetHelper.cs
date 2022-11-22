

using System;
using System.Threading.Tasks;
using Microsoft.JSInterop;

namespace CodeMirror6;

/// <summary>
/// .Net interop from Javascript
/// </summary>
public class DotNetHelper
{
    /// <summary>
    /// Instantiate the function callbacks
    /// </summary>
    /// <param name="setText"></param>
    /// <param name="cursorActivity"></param>
    /// <param name="onFocus"></param>
    /// <param name="onBlur"></param>
    /// <param name="uploadFileBlob"></param>
    /// <param name="requestPasteAction"></param>
    public DotNetHelper(
        Func<Task> setText,
        Func<Task> cursorActivity,
        Func<Task> onFocus,
        Func<Task> onBlur,
        Func<string, string, Task<string>> uploadFileBlob,
        Func<string[], Task<string>> requestPasteAction
    ) {
        SetText = setText;
        DoCursorActivity = cursorActivity;
        DoOnFocus = onFocus;
        DoOnBlur = onBlur;
        DoUploadFileBlob = uploadFileBlob;
        DoRequestPasteAction = requestPasteAction;
    }

    private Func<Task> SetText;
    private Func<Task> DoCursorActivity;
    private Func<Task> DoOnFocus;
    private Func<Task> DoOnBlur;
    private Func<string, string, Task<string>> DoUploadFileBlob;
    private Func<string[], Task<string>> DoRequestPasteAction;

    /* [JSInvokable] public async Task UpdateText() => await SetText();
    [JSInvokable] public async Task CursorActivity() => await DoCursorActivity();
    [JSInvokable] public async Task OnFocus() => await DoOnFocus();
    [JSInvokable] public async Task OnBlur() => await DoOnBlur();
    [JSInvokable] public async Task<string> UploadFileBlob(string base64, string fileName) => await DoUploadFileBlob(base64, fileName);
    [JSInvokable] public async Task<string> RequestPasteAction(string[] options) => await DoRequestPasteAction(options); */
}
