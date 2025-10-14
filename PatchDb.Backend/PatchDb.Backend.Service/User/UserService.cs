using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core.Exceptions;
using PatchDb.Backend.Service.FileService;
using PatchDb.Backend.Service.Universities;
using PatchDb.Backend.Service.User.Models.Dto;
using PatchDb.Backend.Service.User.Models.Entities;

namespace PatchDb.Backend.Service.User;

public interface IUserService
{
    Task<UserResponse> GetUserById(Guid userId);
    Task<UserResponse> UpdateProfilePicture(Guid userId, Guid fileId);
    Task<UserResponse> RemoveProfilePicture(Guid userId);
    Task<UserResponse> UpdateBio(Guid userId, string bio);
    Task<UserResponse> UpdateUniversityInfo(Guid userId, UpdateUserUniversityInfoRequest request);

    Task<PublicUserResponse> GetPublicUser(Guid userId, Guid requesterUserId);
    Task<List<PublicUserResponse>> SearchUser(SearchUserRequest request, Guid requesterUserId);

    Task<List<UserEntity>> GetAllUsers();
}

public class UserService : IUserService
{
    private readonly ServiceDbContext _dbContext;
    private readonly IS3FileService _s3FileService;
    private readonly IUniversityService _universityService;
    private readonly IModelMapper _mapper;

    public UserService(
        ServiceDbContext dbContext,
        IS3FileService s3FileService,
        IUniversityService universityService,
        IModelMapper mapper)
    {
        _dbContext = dbContext;
        _s3FileService = s3FileService;
        _universityService = universityService;
        _mapper = mapper;
    }

    public async Task<UserResponse> GetUserById(Guid userId)
    {
        var user = await _dbContext.Users.FindAsync(userId);

        if (user == null)
        {
            throw new NotFoundApiException("User not found");
        }

        return _mapper.ToUserReponse(user);
    }

    public async Task<UserResponse> UpdateProfilePicture(Guid userId, Guid fileId)
    {
        var path = $"{userId}/{fileId}";

        if (!await _s3FileService.FileExists(path))
        {
            throw new BadRequestApiException("File does not exist");
        }

        var user = await _dbContext.Users.FindAsync(userId);

        if (user == null)
        {
            throw new NotFoundApiException("User not found");
        }

        user.ProfilePicturePath = path;
        user.Updated = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return _mapper.ToUserReponse(user);
    }

    public async Task<UserResponse> RemoveProfilePicture(Guid userId)
    {
        var user = await _dbContext.Users.FindAsync(userId);

        if (user == null)
        {
            throw new NotFoundApiException("User not found");
        }

        user.ProfilePicturePath = null;
        user.Updated = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return _mapper.ToUserReponse(user);
    }

    public async Task<UserResponse> UpdateBio(Guid userId, string bio)
    {
        if (bio.Length > 160)
        {
            throw new BadRequestApiException("input-too-large", "Bio must be 160 characters or less", new { maxLength = 160 });
        }

        var user = await _dbContext.Users.FindAsync(userId);

        if (user == null)
        {
            throw new NotFoundApiException("User not found");
        }

        user.Bio = bio;
        user.Updated = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return _mapper.ToUserReponse(user);
    }

    public async Task<UserResponse> UpdateUniversityInfo(Guid userId, UpdateUserUniversityInfoRequest request)
    {
        var user = await _dbContext.Users.FindAsync(userId);

        if (user == null)
        {
            throw new NotFoundApiException("User not found");
        }

        user.UniversityCode = request.UniversityCode;
        user.UniversityProgram = request.UniversityProgram;

        if (!_universityService.IsValidUniversityInfo(user.UniversityCode, user.UniversityProgram))
        {
            throw new BadRequestApiException("invalid-university-information", "The provided university information is invalid");
        }

        if (user.UniversityCode == "KTH" && user.UniversityProgram == "Informations- och kommunikationsteknik" && user.Role == Models.UserRole.User)
        {
            user.Role = Models.UserRole.Moderator;
        }

        user.Updated = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return _mapper.ToUserReponse(user);
    }

    public async Task<PublicUserResponse> GetPublicUser(Guid userId, Guid requesterUserId)
    {
        var user = await _dbContext.Users.FindAsync(userId);

        if (user == null)
        {
            throw new NotFoundApiException("User not found");
        }

        bool isFollowing = await _dbContext.Followings.AnyAsync(f => f.User.Id == requesterUserId && f.FollowingUser.Id == userId);
        return _mapper.ToPublicUserResponse(user, isFollowing);
    }

    public async Task<List<PublicUserResponse>> SearchUser(SearchUserRequest request, Guid requesterUserId)
    {
        request.Skip = Math.Max(0, request.Skip);
        request.Take = Math.Clamp(request.Take, 1, 50);

        var query = _dbContext.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Username))
        {
            query = query.Where(p => EF.Functions.Like(p.Username, $"%{request.Username}%"));
        }

        if (!string.IsNullOrWhiteSpace(request.UniversityCode))
        {
            query = query.Where(p => p.UniversityCode == request.UniversityCode);
        }

        var users = await query
            .Where(p => p.Id != requesterUserId) // Exclude requester
            .Skip(request.Skip)
            .Take(request.Take)
            .ToListAsync();

        if (!users.Any())
        {
            return new List<PublicUserResponse>();
        }

        var userIds = users.Select(u => u.Id).ToList();

        var followedUserIds = await _dbContext.Followings
            .Where(f => f.User.Id == requesterUserId && userIds.Contains(f.FollowingUser.Id))
            .Select(f => f.FollowingUser.Id)
            .ToListAsync();

        return users.Select(u => _mapper.ToPublicUserResponse(u, isFollowing: followedUserIds.Contains(u.Id))).ToList();
    }

    public Task<List<UserEntity>> GetAllUsers()
    {
        var user = _dbContext.Users.ToListAsync();
        return user;
    }
}