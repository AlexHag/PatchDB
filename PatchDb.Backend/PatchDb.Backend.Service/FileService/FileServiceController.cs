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

    [Authorize]
    [HttpGet("upload-url/patch")]
    [Authorize(Roles = $"{nameof(UserRole.Moderator)},{nameof(UserRole.Admin)}")]
    public ActionResult<FileUploadUrlResponse> GetPatchUploadUrl()
    {
        var fileId = Guid.NewGuid();
        var url = _s3FileService.GetUploadUrl($"patches/{fileId}");

        return Ok(new FileUploadUrlResponse
        {
            FileId = fileId,
            Url = url
        });
    }
}
