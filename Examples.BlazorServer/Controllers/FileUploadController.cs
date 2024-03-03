using Microsoft.AspNetCore.Mvc;

namespace Examples.BlazorServer.Controllers;

[ApiController]
[Route("[controller]")]
public class FileUploadController : ControllerBase
{
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return await Task.FromResult(BadRequest("Upload a file."));
        }

        // Process the file here
        // Example: Save the file to the server, database, etc.

        return await Task.FromResult(Ok(new { file.FileName, file.Length }));
    }
}
