using Microsoft.AspNetCore.Components.Forms;
using System.IO;

namespace Examples.BlazorServer;

public class BrowserFileStream(IBrowserFile browserFile) : Stream
{
    private readonly Stream _baseStream = browserFile.OpenReadStream();

    public override bool CanRead => _baseStream.CanRead;
    public override bool CanSeek => _baseStream.CanSeek;
    public override bool CanWrite => _baseStream.CanWrite;
    public override long Length => _baseStream.Length;

    public override long Position
    {
        get => _baseStream.Position;
        set => _baseStream.Position = value;
    }

    public override void Flush() => _baseStream.Flush();

    public override int Read(byte[] buffer, int offset, int count) =>
        _baseStream.Read(buffer, offset, count);

    public override long Seek(long offset, SeekOrigin origin) =>
        _baseStream.Seek(offset, origin);

    public override void SetLength(long value) =>
        _baseStream.SetLength(value);

    public override void Write(byte[] buffer, int offset, int count) =>
        _baseStream.Write(buffer, offset, count);

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _baseStream.Dispose();
        }

        base.Dispose(disposing);
    }
}

