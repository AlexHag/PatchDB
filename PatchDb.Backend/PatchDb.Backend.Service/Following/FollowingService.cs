using Microsoft.EntityFrameworkCore;

using PatchDb.Backend.Service.Following.Models.Entities;
using PatchDb.Backend.Service.User.Models.Dto;

using Platform.Core.Application.Persistence;

namespace PatchDb.Backend.Service.Following;

public interface IFollowingService
{
    /// <summary>
    ///     Follow a user. Returns the user that was followed.
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="requesterUserId"></param>
    /// <returns></returns>
    Task<PublicUserResponse> Follow(Guid userId, Guid requesterUserId);

    /// <summary>
    ///     Unfollow a user. Returns the user that was unfollowed.
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="requesterUserId"></param>
    /// <returns></returns>
    Task<PublicUserResponse> Unfollow(Guid userId, Guid requesterUserId);

    /// <summary>
    ///     Get a paginated list of followers for the specified user. The requesterUserId is used to determine if the requester is following any of the users in the list.
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="requesterUserId"></param>
    /// <param name="skip"></param>
    /// <param name="take"></param>
    /// <returns></returns>
    Task<PaginationResponse<PublicUserResponse>> GetFollowers(Guid userId, Guid requesterUserId, int skip, int take);

    /// <summary>
    ///     Get a paginated list of users that the specified user is following. The requesterUserId is used to determine if the requester is following any of the users in the list.
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="requesterUserId"></param>
    /// <param name="skip"></param>
    /// <param name="take"></param>
    /// <returns></returns>
    Task<PaginationResponse<PublicUserResponse>> GetFollowing(Guid userId, Guid requesterUserId, int skip, int take);
}

public class FollowingService : IFollowingService
{
    private readonly ServiceDbContext _dbContext;
    private readonly IModelMapper _mapper;

    public FollowingService(
        ServiceDbContext dbContext,
        IModelMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    public async Task<PublicUserResponse> Follow(Guid userId, Guid requesterUserId)
    {
        if (userId == requesterUserId)
        {
            throw new Exception("You cannot follow yourself");
        }

        var existing = await _dbContext.Followings
            .Include(f => f.FollowingUser)
            .FirstOrDefaultAsync(f => f.User.Id == requesterUserId && f.FollowingUser.Id == userId);

        if (existing != null)
        {
            return _mapper.ToPublicUserResponse(existing.FollowingUser, isFollowing: true);
        }

        var requesterUser = await _dbContext.Users.FindAsync(requesterUserId) ?? throw new Exception("User not found");
        var userToFollow = await _dbContext.Users.FindAsync(userId) ?? throw new Exception("Target user not found");

        var following = new FollowingEntity
        {
            Id = Guid.NewGuid(),
            User = requesterUser,
            FollowingUser = userToFollow,
            Created = DateTime.UtcNow
        };

        requesterUser.FollowingCount++;
        userToFollow.FollowersCount++;

        _dbContext.Followings.Add(following);
        await _dbContext.SaveChangesAsync();

        return _mapper.ToPublicUserResponse(userToFollow, isFollowing: true);
    }

    public async Task<PublicUserResponse> Unfollow(Guid userId, Guid requesterUserId)
    {
        var following = await _dbContext.Followings
            .Include(f => f.User)
            .Include(f => f.FollowingUser)
            .FirstOrDefaultAsync(f => f.User.Id == requesterUserId && f.FollowingUser.Id == userId);

        if (following == null)
        {
            var unfollowedUser = await _dbContext.Users.FindAsync(userId) ?? throw new Exception("User not found");
            return _mapper.ToPublicUserResponse(unfollowedUser, isFollowing: false);
        }

        following.User.FollowingCount--;
        following.FollowingUser.FollowersCount--;

        _dbContext.Followings.Remove(following);
        await _dbContext.SaveChangesAsync();

        return _mapper.ToPublicUserResponse(following.FollowingUser, isFollowing: false);
    }

    public async Task<PaginationResponse<PublicUserResponse>> GetFollowers(Guid userId, Guid requesterUserId, int skip, int take)
    {
        skip = Math.Max(0, skip);
        take = Math.Clamp(take, 1, 50);

        var user = await _dbContext.Users.FindAsync(userId) ?? throw new Exception("User not found");

        var followers = await _dbContext.Followings
            .Include(p => p.User)
            .Where(p => p.FollowingUser.Id == userId)
            .Select(p => p.User)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        if (!followers.Any())
        {
            return new PaginationResponse<PublicUserResponse>
            {
                Count = 0,
                Items = []
            };
        }

        var userIds = followers.Select(u => u.Id).ToList();

        // Is the person making the request, following any of the users that are following the user they are searching for?
        var followedUserIds = await _dbContext.Followings
            .Where(f => f.User.Id == requesterUserId && userIds.Contains(f.FollowingUser.Id))
            .Select(f => f.FollowingUser.Id)
            .ToListAsync();

        var response = new PaginationResponse<PublicUserResponse>
        {
            Count = user.FollowersCount,
            Items = followers.Select(p => _mapper.ToPublicUserResponse(p, isFollowing: followedUserIds.Contains(p.Id))).ToList()
        };

        return response;
    }

    public async Task<PaginationResponse<PublicUserResponse>> GetFollowing(Guid userId, Guid requesterUserId, int skip, int take)
    {
        skip = Math.Max(0, skip);
        take = Math.Clamp(take, 1, 50);

        var user = await _dbContext.Users.FindAsync(userId) ?? throw new Exception("User not found");

        var following = await _dbContext.Followings
            .Include(p => p.FollowingUser)
            .Where(p => p.User.Id == userId)
            .Select(p => p.FollowingUser)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        if (!following.Any())
        {
            return new PaginationResponse<PublicUserResponse>
            {
                Count = 0,
                Items = []
            };
        }

        // If the user is searching for their own following list, then of course they are following all of them, so no need to query DB
        if (userId == requesterUserId)
        {
            return new PaginationResponse<PublicUserResponse>
            {
                Count = user.FollowingCount,
                Items = following.Select(p => _mapper.ToPublicUserResponse(p, isFollowing: true)).ToList()
            };
        }

        var userIds = following.Select(u => u.Id).ToList();
    
        // Is the person making the request, following any of the users that the person they are searching for is also following?
        var followedUserIds = await _dbContext.Followings
            .Where(f => f.User.Id == requesterUserId && userIds.Contains(f.FollowingUser.Id))
            .Select(f => f.FollowingUser.Id)
            .ToListAsync();

        return new PaginationResponse<PublicUserResponse>
        {
            Count = user.FollowingCount,
            Items = following.Select(p => _mapper.ToPublicUserResponse(p, isFollowing: followedUserIds.Contains(p.Id))).ToList()
        };
    }
}