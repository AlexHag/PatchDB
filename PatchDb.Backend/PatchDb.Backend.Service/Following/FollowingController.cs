using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Service.User.Models.Dto;
using Platform.Core.Application.Persistence;

namespace PatchDb.Backend.Service.Following;

[ApiController]
[Route("api/user")]
public class FollowingController : ControllerBase
{
    private readonly IFollowingService _followingService;

    public FollowingController(IFollowingService followingService)
    {
        _followingService = followingService;
    }

    [HttpPost("{userId}/follow")]
    public async Task<ActionResult<PublicUserResponse>> Follow(Guid userId)
        => Ok(await _followingService.Follow(userId, requesterUserId: User.UserId()));

    [HttpDelete("{userId}/follow")]
    public async Task<ActionResult<PublicUserResponse>> Unfollow(Guid userId)
        => Ok(await _followingService.Unfollow(userId, requesterUserId: User.UserId()));

    [HttpGet("{userId}/followers")]
    [Authorize]
    public async Task<ActionResult<PaginationResponse<PublicUserResponse>>> GetFollowers(Guid userId, [FromQuery] int skip = 0, [FromQuery] int take = 20)
        => Ok(await _followingService.GetFollowers(userId, requesterUserId: User.UserId(), skip, take));

    [HttpGet("{userId}/following")]
    [Authorize]
    public async Task<ActionResult<PaginationResponse<PublicUserResponse>>> GetFollowing(Guid userId, [FromQuery] int skip = 0, [FromQuery] int take = 20)
        => Ok(await _followingService.GetFollowing(userId, requesterUserId: User.UserId(), skip, take));
}