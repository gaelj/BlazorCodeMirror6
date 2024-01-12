namespace GaelJ.BlazorCodeMirror6.Models;

using Microsoft.AspNetCore.Http;

/// <summary>
/// Represents a custom implementation of the IFormFile interface.
/// </summary>
/// <param name="stream"></param>
/// <param name="fileName"></param>
/// <param name="contentType"></param>
public class CustomFormFile(Stream stream, string fileName, string contentType) : IFormFile
{
    private readonly Stream _stream = stream ?? throw new ArgumentNullException(nameof(stream));
    private readonly string _fileName = fileName ?? throw new ArgumentNullException(nameof(fileName));
    private readonly string _contentType = contentType ?? throw new ArgumentNullException(nameof(contentType));

    /// <inheritdoc/>
    public string ContentType => _contentType;
    /// <inheritdoc/>
    public string ContentDisposition => $"form-data; name=\"{Name}\"; filename=\"{_fileName}\"";
    /// <inheritdoc/>
    public long Length { get; } = stream.Length;
    /// <inheritdoc/>
    public string Name => "file";
    /// <inheritdoc/>
    public string FileName => _fileName;

    /// <inheritdoc/>
    public IHeaderDictionary Headers => new HeaderDictionary();

    /// <inheritdoc/>
    public void CopyTo(Stream target)
    {
        _stream.Seek(0, SeekOrigin.Begin);
        _stream.CopyTo(target);
    }

    /// <inheritdoc/>
    public async Task CopyToAsync(Stream target, CancellationToken cancellationToken = default)
    {
        _stream.Seek(0, SeekOrigin.Begin);
        await _stream.CopyToAsync(target, cancellationToken);
    }

    /// <inheritdoc/>
    public Stream OpenReadStream()
    {
        _stream.Seek(0, SeekOrigin.Begin);
        return _stream;
    }
}
