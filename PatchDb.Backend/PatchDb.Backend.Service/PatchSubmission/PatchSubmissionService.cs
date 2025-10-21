using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core.Exceptions;
using PatchDb.Backend.Service.FileService;
using PatchDb.Backend.Service.Patches.Models.Entities;
using PatchDb.Backend.Service.PatchIndexApi;
using PatchDb.Backend.Service.PatchSubmission.Models;
using PatchDb.Backend.Service.PatchSubmission.Models.Dto;
using PatchDb.Backend.Service.PatchSubmission.Models.Entities;
using PatchDb.Backend.Service.Universities;
using PatchDb.Backend.Service.User.Models;
using PatchDb.Backend.Service.User.Models.Entities;
using PatchDb.Backend.Service.UserPatches;
using PatchDb.Backend.Service.UserPatches.Models.Entities;
using Platform.Core.Application.Persistence;

namespace PatchDb.Backend.Service.PatchSubmission;

public interface IPatchSubmissionService
{
    Task<PatchSubmissionResponse> UploadPatch(Guid userId, UploadPatchRequest request);
    Task<PatchSubmissionResponse> UpdatePatch(Guid userId, UpdatePatchRequest request);
    Task<PaginationResponse<PatchSubmissionResponse>> GetUnpublishedSubmissions(int skip, int take);
    Task<PatchSubmissionResponse> GetPatchSubmission(Guid patchSubmissionId);
}

public class PatchSubmissionService : IPatchSubmissionService
{
    private readonly ServiceDbContext _dbContext;
    private readonly IS3FileService _s3FileService;
    private readonly IPatchIndexApi _patchIndexApi;
    private readonly IUniversityService _universityService;
    private readonly IUserPatchService _userPatchService;
    private readonly ILogger _logger;
    private readonly IModelMapper _mapper;

    public PatchSubmissionService(
        ServiceDbContext dbContext,
        IS3FileService s3FileService,
        IPatchIndexApi patchIndexApi,
        IUniversityService universityService,
        IUserPatchService userPatchService,
        ILogger logger,
        IModelMapper mapper)
    {
        _dbContext = dbContext;
        _s3FileService = s3FileService;
        _patchIndexApi = patchIndexApi;
        _universityService = universityService;
        _userPatchService = userPatchService;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<PatchSubmissionResponse> UploadPatch(Guid userId, UploadPatchRequest request)
    {
        var path = $"{userId}/{request.FileId}";

        if (!await _s3FileService.FileExists(path))
        {
            throw new NotFoundApiException("File not found");
        }

        if (!string.IsNullOrWhiteSpace(request.UniversityCode) && !_universityService.IsValidUniversityCode(request.UniversityCode))
        {
            throw new BadRequestApiException("Invalid university code");
        }

        var entity = new PatchSubmissionEntity
        {
            Id = Guid.NewGuid(),
            UserPatchUploadId = request.UserPatchUploadId,
            FilePath = path,
            Name = request.Name,
            Description = request.Description,
            PatchMaker = request.PatchMaker,
            UniversityCode = request.UniversityCode,
            UniversitySection = request.UniversitySection,
            ReleaseDate = request.ReleaseDate,
            Status = PatchSubmissionStatus.Unpublished,
            UploadedByUserId = userId,
            Created = DateTime.UtcNow
        };

        _dbContext.PatchSubmissions.Add(entity);
        await _dbContext.SaveChangesAsync();

        return _mapper.ToPatchSubmissionResponse(entity);
    }

    public async Task<PatchSubmissionResponse> UpdatePatch(Guid userId, UpdatePatchRequest request)
    {
        var patchSubmission = await _dbContext.PatchSubmissions.FindAsync(request.Id) ?? throw new NotFoundApiException("Patch submission not found");
        var user = await _dbContext.Users.FindAsync(userId) ?? throw new UnauthorizedApiException("User not found");

        ValidateCanUpdatePatch(request, user, patchSubmission);

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            patchSubmission.Name = request.Name;
        }

        if (!string.IsNullOrWhiteSpace(request.Description))
        {
            patchSubmission.Description = request.Description;
        }

        if (!string.IsNullOrWhiteSpace(request.PatchMaker))
        {
            patchSubmission.PatchMaker = request.PatchMaker;
        }

        if (!string.IsNullOrWhiteSpace(request.UniversityCode))
        {
            if (!_universityService.IsValidUniversityCode(request.UniversityCode))
            {
                throw new BadRequestApiException("Invalid university code");
            }

            patchSubmission.UniversityCode = request.UniversityCode;
        }

        if (!string.IsNullOrWhiteSpace(request.UniversitySection))
        {
            patchSubmission.UniversitySection = request.UniversitySection;
        }

        if (request.ReleaseDate.HasValue)
        {
            patchSubmission.ReleaseDate = request.ReleaseDate.Value;
        }

        if (request.Status.HasValue)
        {
            patchSubmission.Status = request.Status.Value;
        }

        patchSubmission.LastUpdatedByUserId = userId;

        if (patchSubmission.PatchNumber.HasValue)
        {
            var patch = await _dbContext.Patches.FindAsync(patchSubmission.PatchNumber.Value) ?? throw new InternalServerErrorApiException("Patch not found");

            if (patchSubmission.Status == PatchSubmissionStatus.Published)
            {
                patch.Name = patchSubmission.Name;
                patch.Description = patchSubmission.Description;
                patch.PatchMaker = patchSubmission.PatchMaker;
                patch.UniversityCode = patchSubmission.UniversityCode;
                patch.UniversitySection = patchSubmission.UniversitySection;
                patch.ReleaseDate = patchSubmission.ReleaseDate;
                patch.Updated = DateTime.UtcNow;
            }
            else
            {
                _dbContext.Patches.Remove(patch);
                await _patchIndexApi.DeleteFromIndex(patchSubmission.PatchNumber.Value);
                patchSubmission.PatchNumber = null;
            }

            await _dbContext.SaveChangesAsync();
        }
        else if (patchSubmission.Status == PatchSubmissionStatus.Published)
        {
            if (string.IsNullOrEmpty(patchSubmission.Name))
            {
                throw new BadRequestApiException("Patch name is required to accept this");
            }

            using (var transaction = await _dbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    var patch = new PatchEntity
                    {
                        FilePath = patchSubmission.FilePath,
                        Name = patchSubmission.Name,
                        Description = patchSubmission.Description,
                        PatchMaker = patchSubmission.PatchMaker,
                        UniversityCode = patchSubmission.UniversityCode,
                        UniversitySection = patchSubmission.UniversitySection,
                        ReleaseDate = patchSubmission.ReleaseDate,
                        PatchSubmissionId = patchSubmission.Id,
                        SubmittedByUserId = patchSubmission.UploadedByUserId,
                        Created = DateTime.UtcNow
                    };

                    _dbContext.Patches.Add(patch);
                    await _dbContext.SaveChangesAsync();

                    await _patchIndexApi.IndexPatch(patch.PatchNumber!.Value, patch.FilePath);

                    patchSubmission.PatchNumber = patch.PatchNumber;
                    await _dbContext.SaveChangesAsync();

                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            try
            {
                await AddPublishedPatchSubmissionToUserPatches(patchSubmission);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to add published patch submission {Id} to user patches...", patchSubmission.Id);
            }
        }
        else
        {
            await _dbContext.SaveChangesAsync();
        }

        return _mapper.ToPatchSubmissionResponse(patchSubmission);
    }

    private async Task AddPublishedPatchSubmissionToUserPatches(PatchSubmissionEntity entity)
    {
        if (!entity.PatchNumber.HasValue)
        {
            _logger.Error("Patch submission {Id} does not have a patch number after being published...", entity.Id);
            throw new InternalServerErrorApiException("Oops something went wrong...");
        }

        if (entity.UserPatchUploadId.HasValue)
        {
            await _userPatchService.UpdatePatchUploadMatch(entity.UploadedByUserId, entity.UserPatchUploadId.Value, entity.PatchNumber.Value);
        }
        else
        {
            var userPatchUploadEntity = new UserPatchUploadEntity
            {
                Id = Guid.NewGuid(),
                UserId = entity.UploadedByUserId,
                FilePath = entity.FilePath,
                Created = entity.Created
            };

            await _dbContext.UserPatchUploads.AddAsync(userPatchUploadEntity);
            await _dbContext.SaveChangesAsync();

            await _userPatchService.UpdatePatchUploadMatch(entity.UploadedByUserId, userPatchUploadEntity.Id, entity.PatchNumber.Value);
        }
    }

    private void ValidateCanUpdatePatch(UpdatePatchRequest request, UserEntity user, PatchSubmissionEntity patchSubmission)
    {
        if (user.Role == UserRole.Admin || user.Role == UserRole.Moderator)
        {
            return;
        }

        if (patchSubmission.UploadedByUserId != user.Id)
        {
            throw new UnauthorizedApiException("You can only update your own patch submissions");
        }

        // TODO: Decide rules for how regular users can update the status

        if (patchSubmission.Status == PatchSubmissionStatus.Rejected || patchSubmission.Status == PatchSubmissionStatus.Duplicate)
        {
            throw new BadRequestApiException("You cannot update this patch");
        }

        // if (request.Status.HasValue && request.Status.Value != PatchSubmissionStatus.Deleted && request.Status.Value != patchSubmission.Status)
        // {
        //     throw new BadRequestApiException("You cannot update this patch");
        // }
    }


    public async Task<PaginationResponse<PatchSubmissionResponse>> GetUnpublishedSubmissions(int skip, int take)
    {
        skip = Math.Max(0, skip);
        take = Math.Clamp(take, 1, 50);

        var patches = await _dbContext.PatchSubmissions
            .OrderByDescending(p => p.ReleaseDate)
            .Where(p => p.Status == PatchSubmissionStatus.Unpublished)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        var response = new PaginationResponse<PatchSubmissionResponse>
        {
            Items = patches.Select(_mapper.ToPatchSubmissionResponse).ToList(),
            Count = await _dbContext.PatchSubmissions.CountAsync(p => p.Status == PatchSubmissionStatus.Unpublished)
        };

        return response;
    }

    public async Task<PatchSubmissionResponse> GetPatchSubmission(Guid patchSubmissionId)
    {
        var patchSubmission = await _dbContext.PatchSubmissions.FindAsync(patchSubmissionId) ?? throw new NotFoundApiException("Patch submission not found");
        return _mapper.ToPatchSubmissionResponse(patchSubmission);
    }
}