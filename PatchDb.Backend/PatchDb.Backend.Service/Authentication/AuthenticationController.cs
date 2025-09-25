
using System.Security.Claims;
using Confluent.Kafka;
using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Core.Authentication.Models;
using PatchDb.Backend.Service.Authentication.Models.Dto;
using PatchDb.Backend.Service.User.Models;
using PatchDb.Backend.Service.User.Models.Dto;
using PatchDb.Backend.Service.User.Models.Entities;

namespace PatchDb.Backend.Service.Authentication;

[ApiController]
[Route("auth")]
public class AuthenticationController : ControllerBase
{
    private readonly ILogger _logger;
    private readonly ServiceDbContext _dbContext;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;

    public AuthenticationController(
        ILogger logger,
        ServiceDbContext dbContext,
        ITokenService tokenService,
        IMapper mapper)
    {
        _logger = logger;
        _dbContext = dbContext;
        _tokenService = tokenService;
        _mapper = mapper;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null)
        {
            return NotFound(new { Message = "Username not found. Please register instead!" });
        }

        if (user.Password == null)
        {
            return BadRequest(new { Message = "Plase use a different method to login." });
        }

        if (!_tokenService.VerifyPassword(request.Password, user.Password))
        {
            // TODO: Add brute force protection
            return BadRequest(new { Message = "Wrong password" });
        }

        // TODO: Create session

        var credentials = _tokenService.GenerateToken(user.Id, AuthenticationMethod.Password, [new Claim("role", user.Role.ToString())]);
        var userResponse = _mapper.Map<UserResponse>(user);

        return new AuthResponse
        {
            User = userResponse,
            Credentials = credentials
        };
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user != null)
        {
            return Conflict(new { Message = "Username already exists. Please login instead!" });
        }

        var passwordHash = _tokenService.HashPassword(request.Password);

        var userEntity = new UserEntity
        {
            Id = Guid.NewGuid(),
            UserState = UserState.Active,
            Role = UserRole.User,
            Username = request.Username,
            Password = passwordHash,
            Created = DateTime.UtcNow
        };

        _dbContext.Users.Add(userEntity);
        await _dbContext.SaveChangesAsync();

        var credentials = _tokenService.GenerateToken(userEntity.Id, AuthenticationMethod.Password, [new Claim("role", userEntity.Role.ToString())]);
        var userResponse = _mapper.Map<UserResponse>(userEntity);

        return new AuthResponse
        {
            User = userResponse,
            Credentials = credentials
        };
    }
}