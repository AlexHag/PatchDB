using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Service.FileService.Models.Dto;
using PatchDb.Backend.Service.User.Models;

namespace PatchDb.Backend.Service.FileService;

[ApiController]
[Route("file-service")]
public class FileServiceController : ControllerBase
{
    private readonly IS3FileService _s3FileService;

    public FileServiceController(IS3FileService s3FileService)
    {
        _s3FileService = s3FileService;
    }

    [Authorize]
    [HttpGet("upload-url")]
    public ActionResult<FileUploadUrlResponse> GetFileUploadUrl()
    {
        var fileId = Guid.NewGuid();
        var url = _s3FileService.GetUploadUrl($"{User.UserId()}/{fileId}");

        return Ok(new FileUploadUrlResponse
        {
            FileId = fileId,
            Url = url
        });
    }

    // Client is not supposed to call this, but should upload the image directly to S3, this is just for testing API through swagger.
    [Authorize]
    [HttpPost("upload")]
    public async Task<ActionResult<FileUploadUrlResponse>> Upload(IFormFile file)
    {
        var fileId = Guid.NewGuid();
        var path = $"{User.UserId()}/{fileId}";

        await using var stream = file.OpenReadStream();
        await _s3FileService.UploadFile(path, stream);
        var url = _s3FileService.GetDownloadUrl(path);

        return Ok(new FileUploadUrlResponse
        {
            FileId = fileId,
            Url = url
        });
    }
}
