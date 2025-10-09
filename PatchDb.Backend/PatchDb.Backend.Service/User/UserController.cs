using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Service.User.Models;
using PatchDb.Backend.Service.User.Models.Dto;

namespace PatchDb.Backend.Service.User;

[ApiController]
[Route("user")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

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

    [HttpGet("all")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult> GetAllUsers()
        => Ok(await _userService.GetAllUsers());
    
    [HttpPut("university-information")]
    [Authorize]
    public async Task<ActionResult<UserResponse>> UpdateUniversityInfo([FromBody] UpdateUserUniversityInfoRequest request)
        => Ok(await _userService.UpdateUniversityInfo(User.UserId(), request));
}