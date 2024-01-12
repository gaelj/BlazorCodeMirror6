using Microsoft.AspNetCore.Components.Forms;

namespace GaelJ.BlazorCodeMirror6.Models;

/// <summary>
/// Represents a custom implementation of the IBrowserFile interface.
/// </summary>
/// <param name="stream"></param>
/// <param name="fileName"></param>
/// <param name="contentType"></param>
/// <param name="lastModified"></param> <summary>
/// </summary>
public class CustomBrowserFile(Stream stream, string fileName, string contentType, DateTimeOffset lastModified) : IBrowserFile
{
    private readonly Stream _stream = stream ?? throw new ArgumentNullException(nameof(stream));
    private readonly string _fileName = fileName ?? throw new ArgumentNullException(nameof(fileName));
    private readonly string _contentType = contentType ?? throw new ArgumentNullException(nameof(contentType));
    private readonly DateTimeOffset _lastModified = lastModified;

    /// <inheritdoc/>
    public string Name => _fileName;

    /// <inheritdoc/>
    public DateTimeOffset LastModified => _lastModified;
    /// <inheritdoc/>
    public long Size => stream.Length;

    /// <inheritdoc/>
    public string ContentType => _contentType;

    /// <inheritdoc/>
    public Stream OpenReadStream(long maxAllowedSize = 512000, CancellationToken cancellationToken = default)
    {
        _stream.Seek(0, SeekOrigin.Begin);
        return _stream;
    }
}
