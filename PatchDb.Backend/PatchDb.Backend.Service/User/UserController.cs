using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Service.User.Models.Dto;
using PatchDb.Backend.Service.User.Models.Entities;

namespace PatchDb.Backend.Service.User;

[ApiController]
[Route("user")]
public class UserController : ControllerBase
{
    private readonly ILogger _logger;
    private readonly ServiceDbContext _dbContext;
    private readonly IMapper _mapper;

    public UserController(
        ILogger logger,
        ServiceDbContext dbContext,
        IMapper mapper)
    {
        _logger = logger;
        _dbContext = dbContext;
        _mapper = mapper;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<UserResponse>> GetUser()
    {
        var user = await _dbContext.Users.FindAsync(User.UserId());

        if (user == null)
        {
            return NotFound(new { Message = "User not found" });
        }

        return _mapper.Map<UserResponse>(user);
    }
}