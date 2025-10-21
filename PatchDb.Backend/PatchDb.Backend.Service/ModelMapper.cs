using PatchDb.Backend.Service.FileService;
using PatchDb.Backend.Service.Patches.Models.Dto;
using PatchDb.Backend.Service.Patches.Models.Entities;
using PatchDb.Backend.Service.PatchSubmission.Models.Dto;
using PatchDb.Backend.Service.PatchSubmission.Models.Entities;
using PatchDb.Backend.Service.Universities;
using PatchDb.Backend.Service.User.Models.Dto;
using PatchDb.Backend.Service.User.Models.Entities;
using PatchDb.Backend.Service.UserPatches.Models.Dto;
using PatchDb.Backend.Service.UserPatches.Models.Entities;

namespace PatchDb.Backend.Service;

public interface IModelMapper
{
    // ---- User Mappings ---------------------------------------------------------------------------------------------
    UserResponse ToUserReponse(UserEntity user);
    PublicUserResponse ToPublicUserResponse(UserEntity user, bool? isFollowing = null);

    // ---- Patch Mappings --------------------------------------------------------------------------------------------
    PatchResponse ToPatchResponse(PatchEntity patch);

    // ---- Patch Submission Mappings ---------------------------------------------------------------------------------
    PatchSubmissionResponse ToPatchSubmissionResponse(PatchSubmissionEntity entity);

    // ---- User Patch Mappings ---------------------------------------------------------------------------------------
    NewMatchingPatchesModel ToNewMatchingPatchesModel(PatchEntity patch, decimal similarity);
    UserPatchUploadModel ToUserPatchUploadModel(UserPatchUploadEntity upload);
    UserPatchModel ToUserPatchModel(UserPatchEntity userPatch);
}

public class ModelMapper : IModelMapper
{
    private readonly IS3FileService _s3FileService;
    private readonly IUniversityService _universityService;

    public ModelMapper(
        IS3FileService s3FileService,
        IUniversityService universityService)
    {
        _s3FileService = s3FileService;
        _universityService = universityService;
    }

    // ---- User Mappings ---------------------------------------------------------------------------------------------
    public UserResponse ToUserReponse(UserEntity user)
        => new UserResponse
        {
            Id = user.Id,
            UserState = user.UserState,
            Role = user.Role,
            Username = user.Username,
            Bio = user.Bio,
            ProfilePictureUrl = !string.IsNullOrEmpty(user.ProfilePicturePath) ? _s3FileService.GetDownloadUrl(user.ProfilePicturePath) : null,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            University = user.UniversityCode != null ? _universityService.GetUniversity(user.UniversityCode) : null,
            UniversityProgram = user.UniversityProgram,
            FollowersCount = user.FollowersCount,
            FollowingCount = user.FollowingCount,
            Created = user.Created,
        };

    public PublicUserResponse ToPublicUserResponse(UserEntity user, bool? isFollowing = null)
        => new PublicUserResponse
        {
            Id = user.Id,
            Role = user.Role,
            Username = user.Username,
            Bio = user.Bio,
            ProfilePictureUrl = !string.IsNullOrEmpty(user.ProfilePicturePath) ? _s3FileService.GetDownloadUrl(user.ProfilePicturePath) : null,
            University = user.UniversityCode != null ? _universityService.GetUniversity(user.UniversityCode) : null,
            UniversityProgram = user.UniversityProgram,
            FollowersCount = user.FollowersCount,
            FollowingCount = user.FollowingCount,
            IsFollowing = isFollowing,
            Created = user.Created,
        };

    // ---- Patch Mappings --------------------------------------------------------------------------------------------
    public PatchResponse ToPatchResponse(PatchEntity patch)
        => new PatchResponse
        {
            PatchNumber = patch.PatchNumber ?? 0,
            ImageUrl = _s3FileService.GetDownloadUrl(patch.FilePath),
            Name = patch.Name,
            Description = patch.Description,
            PatchMaker = patch.PatchMaker,
            University = !string.IsNullOrWhiteSpace(patch.UniversityCode) ? _universityService.GetUniversity(patch.UniversityCode) : null,
            UniversitySection = patch.UniversitySection,
            ReleaseDate = patch.ReleaseDate,
            PatchSubmissionId = patch.PatchSubmissionId,
            SubmittedByUserId = patch.SubmittedByUserId,
            Created = patch.Created,
            Updated = patch.Updated,
        };

    // ---- Patch Submission Mappings ---------------------------------------------------------------------------------
    public PatchSubmissionResponse ToPatchSubmissionResponse(PatchSubmissionEntity entity)
        => new PatchSubmissionResponse
        {
            PatchSubmissionId = entity.Id,
            PatchNumber = entity.PatchNumber,
            Name = entity.Name,
            Description = entity.Description,
            PatchMaker = entity.PatchMaker,
            University = !string.IsNullOrWhiteSpace(entity.UniversityCode) ? _universityService.GetUniversity(entity.UniversityCode) : null,
            UniversitySection = entity.UniversitySection,
            ReleaseDate = entity.ReleaseDate,
            ImageUrl = _s3FileService.GetDownloadUrl(entity.FilePath),
            Status = entity.Status,
            UploadedByUserId = entity.UploadedByUserId,
            LastUpdatedByUserId = entity.LastUpdatedByUserId,
            Created = entity.Created,
            Updated = entity.Updated
        };

    // ---- User Patch Mappings ---------------------------------------------------------------------------------------
    public NewMatchingPatchesModel ToNewMatchingPatchesModel(PatchEntity patch, decimal similarity)
        => new NewMatchingPatchesModel
        {
            PatchNumber = patch.PatchNumber ?? 0,
            ImageUrl = _s3FileService.GetDownloadUrl(patch.FilePath),
            Name = patch.Name,
            Description = patch.Description,
            PatchMaker = patch.PatchMaker,
            University = !string.IsNullOrWhiteSpace(patch.UniversityCode) ? _universityService.GetUniversity(patch.UniversityCode) : null,
            UniversitySection = patch.UniversitySection,
            ReleaseDate = patch.ReleaseDate,
            PatchSubmissionId = patch.PatchSubmissionId,
            Created = patch.Created,
            Updated = patch.Updated,
            Similarity = similarity
        };

    public UserPatchUploadModel ToUserPatchUploadModel(UserPatchUploadEntity upload)
        => new UserPatchUploadModel
        {
            UserPatchUploadId = upload.Id,
            ImageUrl = _s3FileService.GetDownloadUrl(upload.FilePath),
            Created = upload.Created
        };

    public UserPatchModel ToUserPatchModel(UserPatchEntity userPatch)
        => new UserPatchModel
        {
            UserPatchId = userPatch.Id,
            MatchingPatch = ToPatchResponse(userPatch.Patch),
            Uploads = userPatch.Uploads.Select(ToUserPatchUploadModel).ToList(),
            IsFavorite = false,
            AquiredAt = userPatch.Created
        };
}