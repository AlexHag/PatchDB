using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core.Exceptions;
using PatchDb.Backend.Service.FileService;
using PatchDb.Backend.Service.User.Models.Dto;
using PatchDb.Backend.Service.User.Models.Entities;

namespace PatchDb.Backend.Service.User;

public interface IUserService
{
    Task<UserResponse> GetUserById(Guid userId);
    Task<UserResponse?> TryGetUserById(Guid userId);
    Task<UserResponse> UpdateProfilePicture(Guid userId, Guid fileId);
    Task<UserResponse> RemoveProfilePicture(Guid userId);
    Task<UserResponse> UpdateBio(Guid userId, string bio);
    Task<List<UserEntity>> GetAllUsers();
    UserResponse ToUserReponse(UserEntity user);
}

public class UserService : IUserService
{
    private readonly ServiceDbContext _dbContext;
    private readonly IS3FileService _s3FileService;
    private readonly IMapper _mapper;

    public UserService(
        ServiceDbContext dbContext,
        IS3FileService s3FileService,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _s3FileService = s3FileService;
        _mapper = mapper;
    }

    public async Task<UserResponse> GetUserById(Guid userId)
    {
        var user = await _dbContext.Users.FindAsync(userId);

        if (user == null)
        {
            throw new NotFoundApiException("User not found");
        }

        return ToUserReponse(user);
    }

    public async Task<UserResponse?> TryGetUserById(Guid userId)
    {
        var user = await _dbContext.Users.FindAsync(userId);

        if (user == null)
        {
            return null;
        }

        return ToUserReponse(user);
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

        return ToUserReponse(user);
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

        return ToUserReponse(user);
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

        return ToUserReponse(user);
    }

    public UserResponse ToUserReponse(UserEntity user)
    {
        var response = _mapper.Map<UserResponse>(user);

        if (!string.IsNullOrEmpty(user.ProfilePicturePath))
        {
            response.ProfilePictureUrl = _s3FileService.GetDownloadUrl(user.ProfilePicturePath);
        }

        return response;
    }

    public Task<List<UserEntity>> GetAllUsers()
    {
        var user = _dbContext.Users.ToListAsync();
        return user;
    }
}