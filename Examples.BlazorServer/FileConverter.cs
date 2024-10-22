using Microsoft.AspNetCore.Components.Forms;

namespace Examples.BlazorServer;

public static class WebFileConverter
{
    public static IFormFile ConvertToFormFile(this IBrowserFile browserFile)
    {
        ArgumentNullException.ThrowIfNull(browserFile);

        var fileStream = new BrowserFileStream(browserFile);

        var formFile = new FormFile(fileStream, 0, browserFile.Size, browserFile.Name, browserFile.Name)
        {
            Headers = new HeaderDictionary(),
            ContentType = browserFile.ContentType
        };

        return formFile;
    }
}
