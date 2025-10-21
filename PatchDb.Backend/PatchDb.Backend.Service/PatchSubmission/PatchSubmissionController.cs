using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Service.Patches.Models.Dto;
using PatchDb.Backend.Service.PatchSubmission.Models.Dto;
using Platform.Core.Application.Persistence;

namespace PatchDb.Backend.Service.PatchSubmission;

[ApiController]
[Route("api/patch-submission")]
public class PatchSubmissionController : ControllerBase
{
    private readonly IPatchSubmissionService _patchSubmissionService;

    public PatchSubmissionController(IPatchSubmissionService patchSubmissionService)
    {
        _patchSubmissionService = patchSubmissionService;
    }

    [HttpPost("upload")]
    [Authorize]
    public async Task<ActionResult<PatchResponse>> Upload([FromBody] UploadPatchRequest request)
        => Ok(await _patchSubmissionService.UploadPatch(User.UserId(), request));

    [HttpPatch("update")]
    [Authorize]
    public async Task<ActionResult<PatchResponse>> Update([FromBody] UpdatePatchRequest request)
        => Ok(await _patchSubmissionService.UpdatePatch(User.UserId(), request));

    [HttpGet("unpublished")]
    [Authorize]
    public async Task<ActionResult<PaginationResponse<PatchSubmissionResponse>>> GetUnpublishedSubmissions([FromQuery] int skip = 0, [FromQuery] int take = 20)
        => Ok(await _patchSubmissionService.GetUnpublishedSubmissions(skip, take));

    [HttpGet("{patchSubmissionId}")]
    [Authorize]
    public async Task<ActionResult<PatchSubmissionResponse>> GetPatchSubmission([FromRoute] Guid patchSubmissionId)
        => Ok(await _patchSubmissionService.GetPatchSubmission(patchSubmissionId));
}
