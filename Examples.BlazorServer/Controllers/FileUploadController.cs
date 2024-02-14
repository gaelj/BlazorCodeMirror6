using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

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
            return BadRequest("Upload a file.");
        }

        // Process the file here
        // Example: Save the file to the server, database, etc.

        return Ok(new { file.FileName, file.Length });
    }
}
