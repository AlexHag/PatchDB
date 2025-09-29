using System.Security.Claims;

using Microsoft.EntityFrameworkCore;

using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Core.Authentication.Models;
using PatchDb.Backend.Core.Exceptions;
using PatchDb.Backend.Service.Authentication.Models.Dto;
using PatchDb.Backend.Service.User;
using PatchDb.Backend.Service.User.Models;
using PatchDb.Backend.Service.User.Models.Entities;

namespace PatchDb.Backend.Service.Authentication;

public interface IAuthenticationService
{
    Task<AuthResponse> Login(LoginRequest request);
    Task<AuthResponse> Register(RegisterRequest request);
}

public class AuthenticationService : IAuthenticationService
{
    private readonly ServiceDbContext _dbContext;
    private readonly ITokenService _tokenService;
    private readonly IUserService _userService;

    public AuthenticationService(
        ServiceDbContext dbContext,
        ITokenService tokenService,
        IUserService userService)
    {
        _dbContext = dbContext;
        _tokenService = tokenService;
        _userService = userService;
    }

    public async Task<AuthResponse> Login(LoginRequest request)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null)
        {
            throw new NotFoundApiException("username-not-found", "Username not found");
        }

        if (user.Password == null)
        {
            throw new BadRequestApiException("invalid-login-method", "Invalid login method");
        }

        if (!_tokenService.VerifyPassword(request.Password, user.Password))
        {
            // TODO: Add brute force protection
            throw new BadRequestApiException("wrong-password", "Wrong password");
        }

        // TODO: Create session

        var credentials = _tokenService.GenerateToken(user.Id, AuthenticationMethod.Password, [new Claim(ClaimTypes.Role, user.Role.ToString())]);
        var userResponse = _userService.ToUserReponse(user);

        return new AuthResponse
        {
            User = userResponse,
            Credentials = credentials
        };
    }

    public async Task<AuthResponse> Register(RegisterRequest request)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user != null)
        {
            throw new ConflictApiException("username-already-taken", "Username already taken");
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

        var credentials = _tokenService.GenerateToken(userEntity.Id, AuthenticationMethod.Password, [new Claim(ClaimTypes.Role, userEntity.Role.ToString())]);
        var userResponse = _userService.ToUserReponse(userEntity);

        return new AuthResponse
        {
            User = userResponse,
            Credentials = credentials
        };
    }
}