using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PatchDb.Backend.Service.Universities;

[ApiController]
[Route("universities")]
public class UniversityController : ControllerBase
{
    private readonly IUniversityService _universityService;

    public UniversityController(IUniversityService universityService)
    {
        _universityService = universityService;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<UniversityAndProgramModel>>> GetAll()
        => Ok(_universityService.GetAll());
}