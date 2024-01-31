using GaelJ.BlazorCodeMirror6.Models;
using Microsoft.AspNetCore.Components;

namespace Examples.Common;

public partial class Example : ComponentBase
{
    private static async Task<List<CodeMirrorCompletion>> GetMentionCompletions()
    {
        await Task.Delay(1000);
        return await Task.FromResult<List<CodeMirrorCompletion>>(
            [
                new CodeMirrorCompletion {
                    Label = "abc",
                    Detail = "Alice",
                    Info = "Alice is a person",
                    // Type = "variable"
                },
                new CodeMirrorCompletion {
                    Label = "bcd",
                    Detail = "Bob",
                    Info = "Bob is a person",
                    // Type = "variable"
                },
                new CodeMirrorCompletion {
                    Label = "cde",
                    Detail = "Carol",
                    Info = "Carol is a person",
                    // Type = "variable"
                },
                new CodeMirrorCompletion {
                    Label = "def",
                    Detail = "Dave",
                    Info = "Dave is a person",
                    // Type = "variable"
                },
                new CodeMirrorCompletion {
                    Label = "eee",
                    Detail = "Eve",
                    Info = "Eve is a person",
                    // Type = "variable"
                },
                new CodeMirrorCompletion {
                    Label = "fff",
                    Detail = "Frank",
                    Info = "Frank is a person",
                    // Type = "variable"
                },
                new CodeMirrorCompletion {
                    Label = "ggg",
                    Detail = "Grace",
                    Info = "Grace is a person",
                    // Type = "variable"
                },
                new CodeMirrorCompletion {
                    Label = "hhh",
                    Detail = "Heidi",
                    Info = "Heidi is a person",
                    // Type = "variable"
                },
                new CodeMirrorCompletion {
                    Label = "Ivan",
                    Detail = "Ivan",
                    Info = "Ivan is a person",
                    // Type = "variable"
                },
                new CodeMirrorCompletion {
                    Label = "Judy",
                    Detail = "Judy",
                    Info = "Judy is a person",
                    // Type = "variable"
                },
                new CodeMirrorCompletion {
                    Label = "Mallory",
                    Detail = "Mallory",
                    Info = "Mallory is a person",
                    // Type = "variable"
                },
                new CodeMirrorCompletion {
                    Label = "Oscar",
                    Detail = "Oscar",
                    Info = "Oscar is a person",
                    // Type = "variable"
                },
                new CodeMirrorCompletion {
                    Label = "Peggy",
                    Detail = "Peggy",
                    Info = "Peggy is a person",
                    // Type = "variable"
                },
            ]
        );
    }
}
