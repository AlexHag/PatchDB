using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PatchDb.Backend.Service.Universities;

[ApiController]
[Route("api/universities")]
public class UniversityController : ControllerBase
{
    private readonly IUniversityService _universityService;

    public UniversityController(IUniversityService universityService)
    {
        _universityService = universityService;
    }

    [HttpGet("programs")]
    [Authorize]
    public async Task<ActionResult<List<UniversityAndProgramModel>>> GetUniversitiesAndPrograms()
        => Ok(_universityService.GetUniversitiesAndPrograms());

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<UniversityModel>>> GetUniversities()
        => Ok(_universityService.GetUniversities());
}