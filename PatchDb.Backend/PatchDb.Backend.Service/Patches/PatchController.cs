using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Service.Patches.Models.Dto;
using Platform.Core.Application.Persistence;

namespace PatchDb.Backend.Service.Patches;

[ApiController]
[Route("api/patches")]
public class PatchController : ControllerBase
{
    private readonly IPatchService _patchService;

    public PatchController(IPatchService patchService)
    {
        _patchService = patchService;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<PaginationResponse<PatchResponse>>> GetPatches([FromQuery] int skip = 0, [FromQuery] int take = 20)
        => Ok(await _patchService.GetPatches(skip, take, requesterUserId: User.UserId()));

    [HttpGet("{patchNumber}")]
    [Authorize]
    public async Task<ActionResult<PatchResponse>> GetPatch(int patchNumber)
        => Ok(await _patchService.GetPatch(patchNumber, requesterUserId: User.UserId()));

    [HttpPost("search")]
    [Authorize]
    public async Task<ActionResult<PaginationResponse<PatchResponse>>> SearchPatches([FromBody] SearchPatchRequest request)
        => Ok(await _patchService.SearchPatches(request, requesterUserId: User.UserId()));
}