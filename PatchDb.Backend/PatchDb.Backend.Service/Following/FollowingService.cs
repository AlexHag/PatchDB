using MassTransit.Initializers;
using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Service.Following.Models.Entities;
using PatchDb.Backend.Service.User.Models.Dto;
using Platform.Core.Application.Persistence;

namespace PatchDb.Backend.Service.Following;

public interface IFollowingService
{
    Task<UserResponse> Follow(Guid userId, Guid targetUserId);
    Task<UserResponse> Unfollow(Guid userId, Guid targetUserId);
    Task<PaginationResponse<UserResponse>> GetFollowers(Guid userId, int skip, int take);
    Task<PaginationResponse<UserResponse>> GetFollowing(Guid userId, int skip, int take);
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

    public async Task<UserResponse> Follow(Guid userId, Guid targetUserId)
    {
        var existing = await _dbContext.Followings
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.User.Id == userId && f.FollowingUser.Id == targetUserId);
        
        if (existing != null)
        {
            return _mapper.ToUserReponse(existing.User, hidePii: true);
        }

        var user = await _dbContext.Users.FindAsync(userId) ?? throw new Exception("User not found");
        var targetUser = await _dbContext.Users.FindAsync(targetUserId) ?? throw new Exception("Target user not found");

        var following = new FollowingEntity
        {
            Id = Guid.NewGuid(),
            User = user,
            FollowingUser = targetUser,
            Created = DateTime.UtcNow
        };

        user.FollowingCount++;
        targetUser.FollowersCount++;

        _dbContext.Followings.Add(following);
        await _dbContext.SaveChangesAsync();

        return _mapper.ToUserReponse(user, hidePii: true);
    }
    
    public async Task<UserResponse> Unfollow(Guid userId, Guid targetUserId)
    {
        var following = await _dbContext.Followings
            .Include(f => f.User)
            .Include(f => f.FollowingUser)
            .FirstOrDefaultAsync(f => f.User.Id == userId && f.FollowingUser.Id == targetUserId);

        if (following == null)
        {
            var user = await _dbContext.Users.FindAsync(userId) ?? throw new Exception("User not found");
            return _mapper.ToUserReponse(user);
        }

        following.User.FollowingCount--;
        following.FollowingUser.FollowersCount--;

        _dbContext.Followings.Remove(following);
        await _dbContext.SaveChangesAsync();

        return _mapper.ToUserReponse(following.User, hidePii: true);
    }

    public async Task<PaginationResponse<UserResponse>> GetFollowers(Guid userId, int skip, int take)
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

        var response = new PaginationResponse<UserResponse>
        {
            Count = user.FollowersCount,
            Items = followers.Select(p => _mapper.ToUserReponse(p, hidePii: true)).ToList()
        };

        return response;
    }

    public async Task<PaginationResponse<UserResponse>> GetFollowing(Guid userId, int skip, int take)
    {
        skip = Math.Max(0, skip);
        take = Math.Clamp(take, 1, 50);

        var user = await _dbContext.Users.FindAsync(userId) ?? throw new Exception("User not found");

        var following = await _dbContext.Followings
            .Include(p => p.FollowingUser)
            .Where(p => p.User.Id == userId)
            .Select(p => p.FollowingUser)
            .ToListAsync();

        return new PaginationResponse<UserResponse>
        {
            Count = user.FollowingCount,
            Items = following.Select(p => _mapper.ToUserReponse(p, hidePii: true)).ToList()
        };
    }
}