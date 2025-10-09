using Microsoft.AspNetCore.Mvc;
using PatchDb.Backend.Service.Patches.Models.Dto;

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

    [HttpGet]
    public async Task<ActionResult<List<PatchResponse>>> GetPatches([FromQuery] int skip = 0, [FromQuery] int take = 20)
        => Ok(await _patchService.GetPatches(skip, take));

    [HttpGet("{patchNumber}")]
    public async Task<ActionResult<PatchResponse>> GetPatch(int patchNumber)
        => Ok(await _patchService.GetPatch(patchNumber));

    [HttpPost("search")]
    public async Task<ActionResult<List<PatchResponse>>> SearchPatches([FromBody] SearchPatchRequest request)
        => Ok(await _patchService.SearchPatches(request));
}