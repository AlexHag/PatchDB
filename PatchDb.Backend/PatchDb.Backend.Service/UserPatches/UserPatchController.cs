using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Service.UserPatches.Models.Dto;

namespace PatchDb.Backend.Service.UserPatches;

[ApiController]
[Route("api/user-patches")]
public class UserPatchController : ControllerBase
{
    private readonly IUserPatchService _userPatchService;

    public UserPatchController(
        IUserPatchService userPatchService)
    {
        _userPatchService = userPatchService;
    }

    [Authorize]
    [HttpPost("upload/{fileId}")]
    public async Task<ActionResult<PatchUploadResponse>> UploadPatch(Guid fileId)
        => Ok(await _userPatchService.Upload(User.UserId(), fileId));

    [Authorize]
    [HttpPatch("{userPatchUploadId}/matching-patch-number/{matchingPatchNumber}")]
    public async Task<ActionResult<UserPatchModel>> UpdatePatchUploadMatch(Guid userPatchUploadId, int matchingPatchNumber)
        => Ok(await _userPatchService.UpdatePatchUploadMatch(User.UserId(), userPatchUploadId, matchingPatchNumber));

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<GetUserPatchesResponse>> GetUserPatches()
    {
        var userPatchesTask = _userPatchService.GetUserPatches(User.UserId());
        var unmatchedPatchesTask = _userPatchService.GetUnmatchedUploads(User.UserId());

        return Ok(new GetUserPatchesResponse
        {
            Patches = await userPatchesTask,
            UnmatchesPatches = await unmatchedPatchesTask
        });
    }

    [HttpGet("{userId}")]
    [Authorize]
    public async Task<ActionResult<GetUserPatchesResponse>> GetUserPatches(Guid userId)
    {
        var userPatchesTask = _userPatchService.GetUserPatches(userId);

        return Ok(new GetUserPatchesResponse
        {
            Patches = await userPatchesTask
        });
    }
}