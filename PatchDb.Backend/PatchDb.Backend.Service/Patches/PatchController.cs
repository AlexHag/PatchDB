using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Service.Patches.Models.Dto;
using PatchDb.Backend.Service.User.Models;

namespace PatchDb.Backend.Service.Patches;

[ApiController]
[Route("patches")]
public class PatchController : ControllerBase
{
    private readonly IPatchService _patchService;

    public PatchController(IPatchService patchService)
    {
        _patchService = patchService;
    }

    [HttpPatch("update")]
    [Authorize(Roles = $"{nameof(UserRole.Moderator)},{nameof(UserRole.Admin)}")]
    public async Task<ActionResult<PatchResponse>> Update([FromBody] UpdatePatchRequest request)
        => Ok(await _patchService.UpdatePatchAsync(User.UserId(), request));

    [HttpGet("unclassified")]
    [Authorize(Roles = $"{nameof(UserRole.Moderator)},{nameof(UserRole.Admin)}")]
    public async Task<ActionResult<PatchResponse>> GetUnclassifiedPatch()
        => Ok(await _patchService.GetUnclassifiedPatchAsync());

    [HttpGet]
    public async Task<ActionResult<List<PatchResponse>>> GetPatches([FromQuery] int skip = 0, [FromQuery] int take = 20)
        => Ok(await _patchService.GetPatches(skip, take));

    [HttpPost("search")]
    public async Task<ActionResult<List<PatchResponse>>> SearchPatches([FromBody] SearchPatchRequest request)
        => Ok(await _patchService.SearchPatches(request));

    [HttpPost("upload")]
    [Authorize(Roles = $"{nameof(UserRole.Moderator)},{nameof(UserRole.Admin)}")]
    public async Task<ActionResult<PatchResponse>> Upload([FromBody] UploadPatchRequest request)
        => Ok(await _patchService.UploadPatchAsync(User.UserId(), request));
}