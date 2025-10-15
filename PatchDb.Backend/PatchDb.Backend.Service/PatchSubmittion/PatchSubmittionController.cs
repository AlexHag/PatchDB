using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Service.Patches.Models.Dto;
using PatchDb.Backend.Service.PatchSubmittion.Models.Dto;
using Platform.Core.Application.Persistence;

namespace PatchDb.Backend.Service.PatchSubmittion;

[ApiController]
[Route("api/patch-submittion")]
public class PatchSubmittionController : ControllerBase
{
    private readonly IPatchSubmittionService _patchSubmittionService;

    public PatchSubmittionController(IPatchSubmittionService patchSubmittionService)
    {
        _patchSubmittionService = patchSubmittionService;
    }

    [HttpPost("upload")]
    [Authorize]
    public async Task<ActionResult<PatchResponse>> Upload([FromBody] UploadPatchRequest request)
        => Ok(await _patchSubmittionService.UploadPatch(User.UserId(), request));

    [HttpPatch("update")]
    [Authorize]
    public async Task<ActionResult<PatchResponse>> Update([FromBody] UpdatePatchRequest request)
        => Ok(await _patchSubmittionService.UpdatePatch(User.UserId(), request));

    [HttpGet("pending")]
    [Authorize]
    public async Task<ActionResult<PaginationResponse<PatchSubmittionResponse>>> GetPendingSubmittions([FromQuery] int skip = 0, [FromQuery] int take = 20)
        => Ok(await _patchSubmittionService.GetPendingSubmittions(skip, take));

    [HttpGet("{patchSubmittionId}")]
    [Authorize]
    public async Task<ActionResult<PatchSubmittionResponse>> GetPatchSubmittion([FromRoute] Guid patchSubmittionId)
        => Ok(await _patchSubmittionService.GetPatchSubmittion(patchSubmittionId));
}
