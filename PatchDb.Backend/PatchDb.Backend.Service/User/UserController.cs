using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Service.User.Models;
using PatchDb.Backend.Service.User.Models.Dto;

namespace PatchDb.Backend.Service.User;

[ApiController]
[Route("api/user")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    ///     Get your own user details
    /// </summary>
    /// <returns></returns>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<UserResponse>> GetUser()
        => Ok(await _userService.GetUserById(User.UserId()));

    [HttpPut("profile-picture")]
    [Authorize]
    public async Task<ActionResult<UserResponse>> UpdateProfilePicture([FromBody] UpdateProfilePictureRequest request)
        => Ok(await _userService.UpdateProfilePicture(User.UserId(), request.FileId));

    [HttpDelete("profile-picture")]
    [Authorize]
    public async Task<ActionResult<UserResponse>> RemoveProfilePicture()
        => Ok(await _userService.RemoveProfilePicture(User.UserId()));

    [HttpPut("bio")]
    [Authorize]
    public async Task<ActionResult<UserResponse>> UpdateBio([FromBody] UpdateBioRequest request)
        => Ok(await _userService.UpdateBio(User.UserId(), request.Bio ?? string.Empty));

    [HttpPut("university-information")]
    [Authorize]
    public async Task<ActionResult<UserResponse>> UpdateUniversityInfo([FromBody] UpdateUserUniversityInfoRequest request)
        => Ok(await _userService.UpdateUniversityInfo(User.UserId(), request));

    /// <summary>
    ///     Get another user details
    /// </summary>
    /// <param name="userId"></param>
    /// <returns></returns>
    [HttpGet("{userId}")]
    [Authorize]
    public async Task<ActionResult<UserResponse>> GetPublicUser(Guid userId)
        => Ok(await _userService.GetPublicUser(userId, requesterUserId: User.UserId()));

    /// <summary>
    ///     Search for other users
    /// </summary>
    /// <param name="request"></param>
    /// <returns></returns>
    [HttpPost("search")]
    [Authorize]
    public async Task<ActionResult<List<UserResponse>>> SearchUser([FromBody] SearchUserRequest request)
        => Ok(await _userService.SearchUser(request, requesterUserId: User.UserId()));
    
    [HttpGet("all")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult> GetAllUsers()
        => Ok(await _userService.GetAllUsers());
}