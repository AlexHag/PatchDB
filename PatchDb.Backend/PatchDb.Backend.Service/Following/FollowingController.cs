using Microsoft.AspNetCore.Mvc;
using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Service.User.Models.Dto;

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
    public async Task<ActionResult> Follow(Guid userId)
        => Ok(await _followingService.Follow(User.UserId(), userId));

    [HttpDelete("{userId}/follow")]
    public async Task<ActionResult> Unfollow(Guid userId)
        => Ok(await _followingService.Unfollow(User.UserId(), userId));

    [HttpGet("{userId}/followers")]
    public async Task<ActionResult<List<UserResponse>>> GetFollowers(Guid userId, [FromQuery] int skip = 0, [FromQuery] int take = 20)
        => Ok(await _followingService.GetFollowers(userId, skip, take));

    [HttpGet("{userId}/following")]
    public async Task<ActionResult<List<UserResponse>>> GetFollowing(Guid userId, [FromQuery] int skip = 0, [FromQuery] int take = 20)
        => Ok(await _followingService.GetFollowing(userId, skip, take));
}