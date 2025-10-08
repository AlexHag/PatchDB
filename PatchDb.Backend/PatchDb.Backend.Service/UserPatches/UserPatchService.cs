using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core.Exceptions;
using PatchDb.Backend.Service.FileService;
using PatchDb.Backend.Service.Patches.Models.Dto;
using PatchDb.Backend.Service.Patches.Models.Entities;
using PatchDb.Backend.Service.PatchIndexApi;
using PatchDb.Backend.Service.UserPatches.Models.Dto;
using PatchDb.Backend.Service.UserPatches.Models.Entities;

namespace PatchDb.Backend.Service.UserPatches;

public interface IUserPatchService
{
    Task<PatchUploadResponse> Upload(Guid userId, Guid fileId);
    Task<UserPatchModel> UpdatePatchUploadMatch(Guid userId, Guid userPatchUploadId, int matchingPatchNumber);

    // TODO: Pagination
    Task<List<UserPatchModel>> GetUserPatches(Guid userId);
    Task<List<UserPatchUploadModel>> GetUnmatchedUploads(Guid userId);

    // Task DeleteUpload(Guid userPatchUploadId);
    // Task DeleteUserPatch(Guid userPatchId);

    // Task<UserPatchModel> MarkFavorite();
    // Task<UserPatchModel> UnmarkFavorite();
}

public class UserPatchService : IUserPatchService
{
    private readonly ServiceDbContext _dbContext;
    private readonly IS3FileService _s3FileService;
    private readonly IPatchIndexApi _patchIndexApi;
    private readonly IMapper _mapper;

    public UserPatchService(
        ServiceDbContext dbContext,
        IS3FileService s3FileService,
        IPatchIndexApi patchIndexApi,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _s3FileService = s3FileService;
        _patchIndexApi = patchIndexApi;
        _mapper = mapper;
    }

    public async Task<PatchUploadResponse> Upload(Guid userId, Guid fileId)
    {
        var path = $"{userId}/{fileId}";

        if (!await _s3FileService.FileExists(path))
        {
            throw new FileNotFoundException("File not found");
        }

        var upload = new UserPatchUploadEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FilePath = path,
            Created = DateTime.UtcNow
        };

        _dbContext.UserPatchUploads.Add(upload);
        await _dbContext.SaveChangesAsync();

        var apiResponse = new PatchUploadResponse
        {
            Upload = ToUserPatchUploadModel(upload)
        };

        var searchResponse = await _patchIndexApi.SearchPatch(path);

        if (searchResponse.Matches == null || searchResponse.Matches.Count == 0)
        {
            return apiResponse;
        }

        foreach (var match in searchResponse.Matches)
        {
            var ownedUserPatchEntity = await _dbContext.UserPatches
                .Include(up => up.Uploads)
                .Include(up => up.Patch)
                .FirstOrDefaultAsync(up => up.UserId == userId && up.PatchNumber == match.Id);

            if (ownedUserPatchEntity != null)
            {
                apiResponse.OwnedMatchingPatches.Add(new OwnedMatchingPatchesModel
                {
                    UserPatchId = ownedUserPatchEntity.Id,
                    MatchingPatch = ToPatchResponse(ownedUserPatchEntity.Patch),
                    Uploads = ownedUserPatchEntity.Uploads.Select(ToUserPatchUploadModel).ToList(),
                    IsFavorite = ownedUserPatchEntity.IsFavorite,
                    AquiredAt = ownedUserPatchEntity.Created,
                    Similarity = match.Score
                });

                continue;
            }

            var newMatchingPatchEntity = await _dbContext.Patches
                .FirstOrDefaultAsync(p => p.PatchNumber == match.Id);

            if (newMatchingPatchEntity != null)
            {
                var newMatchingPatch = ToNewMatchingPatchesModel(newMatchingPatchEntity);
                newMatchingPatch.Similarity = match.Score;
                apiResponse.NewMatchingPatches.Add(newMatchingPatch);
            }
        }

        return apiResponse;
    }

    public async Task<UserPatchModel> UpdatePatchUploadMatch(Guid userId, Guid userPatchUploadId, int matchingPatchNumber)
    {
        var upload = await _dbContext.UserPatchUploads
            .FirstOrDefaultAsync(u => u.Id == userPatchUploadId && u.UserId == userId);

        if (upload == null)
        {
            throw new KeyNotFoundException("Upload not found");
        }

        var ownedPatch = await _dbContext.UserPatches
            .Include(up => up.Uploads)
            .Include(up => up.Patch)
            .FirstOrDefaultAsync(up => up.UserId == upload.UserId && up.PatchNumber == matchingPatchNumber);

        if (ownedPatch != null)
        {
            ownedPatch.Uploads.Add(upload);
            upload.UserPatchId = ownedPatch.Id;
            upload.UserPatch = ownedPatch;

            await _dbContext.SaveChangesAsync();
            return ToUserPatchModel(ownedPatch);
        }

        var newPatch = await _dbContext.Patches
            .FirstOrDefaultAsync(p => p.PatchNumber == matchingPatchNumber);

        if (newPatch == null)
        {
            throw new NotFoundApiException("Matching patch not found");
        }

        var newUserPatch = new UserPatchEntity
        {
            Id = Guid.NewGuid(),
            UserId = upload.UserId,
            PatchNumber = matchingPatchNumber,
            Patch = newPatch,
            Uploads = new List<UserPatchUploadEntity> { upload },
            IsFavorite = false,
            Created = DateTime.UtcNow
        };

        _dbContext.UserPatches.Add(newUserPatch);
        await _dbContext.SaveChangesAsync();

        upload.UserPatchId = newUserPatch.Id;
        upload.UserPatch = newUserPatch;

        await _dbContext.SaveChangesAsync();

        return ToUserPatchModel(newUserPatch);
    }

    public async Task<List<UserPatchModel>> GetUserPatches(Guid userId)
    {
        var userPatches = await _dbContext.UserPatches
            .Include(up => up.Patch)
            .Include(up => up.Uploads)
            .Where(up => up.UserId == userId)
            .ToListAsync();
        
        return userPatches.Select(ToUserPatchModel).ToList();
    }

    public async Task<List<UserPatchUploadModel>> GetUnmatchedUploads(Guid userId)
    {
        var uploads = await _dbContext.UserPatchUploads
            .Where(u => u.UserId == userId && u.UserPatchId == null)
            .AsNoTracking()
            .ToListAsync();
        
        return uploads.Select(ToUserPatchUploadModel).ToList();
    }

    private PatchResponse ToPatchResponse(PatchEntity patch)
    {
        var response = _mapper.Map<PatchResponse>(patch);
        response.ImageUrl = _s3FileService.GetDownloadUrl(patch.FilePath);
        return response;
    }

    private NewMatchingPatchesModel ToNewMatchingPatchesModel(PatchEntity patch)
    {
        var model = _mapper.Map<NewMatchingPatchesModel>(patch);
        model.ImageUrl = _s3FileService.GetDownloadUrl(patch.FilePath);
        return model;
    }

    private UserPatchUploadModel ToUserPatchUploadModel(UserPatchUploadEntity upload)
    {
        var model = _mapper.Map<UserPatchUploadModel>(upload);
        model.UserPatchUploadId = upload.Id;
        model.ImageUrl = _s3FileService.GetDownloadUrl(upload.FilePath);
        return model;
    }

    private UserPatchModel ToUserPatchModel(UserPatchEntity userPatch)
    {
        var model = _mapper.Map<UserPatchModel>(userPatch);
        model.UserPatchId = userPatch.Id;
        model.MatchingPatch = ToPatchResponse(userPatch.Patch);
        model.Uploads = userPatch.Uploads.Select(ToUserPatchUploadModel).ToList();
        model.AquiredAt = userPatch.Created;
        return model;
    }
}