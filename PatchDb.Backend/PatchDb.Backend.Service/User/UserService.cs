using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core.Exceptions;
using PatchDb.Backend.Service.FileService;
using PatchDb.Backend.Service.Universities;
using PatchDb.Backend.Service.User.Models.Dto;
using PatchDb.Backend.Service.User.Models.Entities;

namespace PatchDb.Backend.Service.User;

public interface IUserService
{
    Task<UserResponse> GetUserById(Guid userId, bool hidePii = false);
    Task<UserResponse?> TryGetUserById(Guid userId);
    Task<UserResponse> UpdateProfilePicture(Guid userId, Guid fileId);
    Task<UserResponse> RemoveProfilePicture(Guid userId);
    Task<UserResponse> UpdateBio(Guid userId, string bio);
    Task<UserResponse> UpdateUniversityInfo(Guid userId, UpdateUserUniversityInfoRequest request);
    Task<List<UserEntity>> GetAllUsers();
    Task<List<UserResponse>> SearchUser(SearchUserRequest request);
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

    public async Task<UserResponse> GetUserById(Guid userId, bool hidePii = false)
    {
        var user = await _dbContext.Users.FindAsync(userId);

        if (user == null)
        {
            throw new NotFoundApiException("User not found");
        }

        return _mapper.ToUserReponse(user, hidePii);
    }

    public async Task<UserResponse?> TryGetUserById(Guid userId)
    {
        var user = await _dbContext.Users.FindAsync(userId);

        if (user == null)
        {
            return null;
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

        user.Updated = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return _mapper.ToUserReponse(user);
    }

    public async Task<List<UserResponse>> SearchUser(SearchUserRequest request)
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
            .Skip(request.Skip)
            .Take(request.Take)
            .ToListAsync();

        return users.Select(u => _mapper.ToUserReponse(u, hidePii: true)).ToList();
    }

    public Task<List<UserEntity>> GetAllUsers()
    {
        var user = _dbContext.Users.ToListAsync();
        return user;
    }
}