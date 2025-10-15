using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core.Exceptions;
using PatchDb.Backend.Service.FileService;
using PatchDb.Backend.Service.Patches.Models.Entities;
using PatchDb.Backend.Service.PatchIndexApi;
using PatchDb.Backend.Service.PatchSubmittion.Models;
using PatchDb.Backend.Service.PatchSubmittion.Models.Dto;
using PatchDb.Backend.Service.PatchSubmittion.Models.Entities;
using PatchDb.Backend.Service.Universities;
using PatchDb.Backend.Service.User.Models;
using PatchDb.Backend.Service.User.Models.Entities;
using PatchDb.Backend.Service.UserPatches;
using PatchDb.Backend.Service.UserPatches.Models.Entities;
using Platform.Core.Application.Persistence;

namespace PatchDb.Backend.Service.PatchSubmittion;

public interface IPatchSubmittionService
{
    Task<PatchSubmittionResponse> UploadPatch(Guid userId, UploadPatchRequest request);
    Task<PatchSubmittionResponse> UpdatePatch(Guid userId, UpdatePatchRequest request);
    Task<PaginationResponse<PatchSubmittionResponse>> GetPendingSubmittions(int skip, int take);
    Task<PatchSubmittionResponse> GetPatchSubmittion(Guid patchSubmittionId);
}

public class PatchSubmittionService : IPatchSubmittionService
{
    private readonly ServiceDbContext _dbContext;
    private readonly IS3FileService _s3FileService;
    private readonly IPatchIndexApi _patchIndexApi;
    private readonly IUniversityService _universityService;
    private readonly IUserPatchService _userPatchService;
    private readonly ILogger _logger;
    private readonly IModelMapper _mapper;

    public PatchSubmittionService(
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

    public async Task<PatchSubmittionResponse> UploadPatch(Guid userId, UploadPatchRequest request)
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

        var entity = new PatchSubmittionEntity
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
            Status = PatchSubmittionStatus.Pending,
            UploadedByUserId = userId,
            Created = DateTime.UtcNow
        };

        _dbContext.PatchSubmittions.Add(entity);
        await _dbContext.SaveChangesAsync();

        return _mapper.ToPatchSubmittionResponse(entity);
    }

    public async Task<PatchSubmittionResponse> UpdatePatch(Guid userId, UpdatePatchRequest request)
    {
        var patchSubmittion = await _dbContext.PatchSubmittions.FindAsync(request.Id) ?? throw new NotFoundApiException("Patch submittion not found");
        var user = await _dbContext.Users.FindAsync(userId) ?? throw new UnauthorizedApiException("User not found");

        ValidateCanUpdatePatch(request, user, patchSubmittion);

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            patchSubmittion.Name = request.Name;
        }

        if (!string.IsNullOrWhiteSpace(request.Description))
        {
            patchSubmittion.Description = request.Description;
        }

        if (!string.IsNullOrWhiteSpace(request.PatchMaker))
        {
            patchSubmittion.PatchMaker = request.PatchMaker;
        }

        if (!string.IsNullOrWhiteSpace(request.UniversityCode))
        {
            if (!_universityService.IsValidUniversityCode(request.UniversityCode))
            {
                throw new BadRequestApiException("Invalid university code");
            }

            patchSubmittion.UniversityCode = request.UniversityCode;
        }

        if (!string.IsNullOrWhiteSpace(request.UniversitySection))
        {
            patchSubmittion.UniversitySection = request.UniversitySection;
        }

        if (request.ReleaseDate.HasValue)
        {
            patchSubmittion.ReleaseDate = request.ReleaseDate.Value;
        }

        if (request.Status.HasValue)
        {
            patchSubmittion.Status = request.Status.Value;
        }

        patchSubmittion.LastUpdatedByUserId = userId;

        if (patchSubmittion.PatchNumber.HasValue)
        {
            var patch = await _dbContext.Patches.FindAsync(patchSubmittion.PatchNumber.Value) ?? throw new InternalServerErrorApiException("Patch not found");

            if (patchSubmittion.Status == PatchSubmittionStatus.Accepted)
            {
                patch.Name = patchSubmittion.Name;
                patch.Description = patchSubmittion.Description;
                patch.PatchMaker = patchSubmittion.PatchMaker;
                patch.UniversityCode = patchSubmittion.UniversityCode;
                patch.UniversitySection = patchSubmittion.UniversitySection;
                patch.ReleaseDate = patchSubmittion.ReleaseDate;
                patch.Updated = DateTime.UtcNow;
            }
            else
            {
                _dbContext.Patches.Remove(patch);
                await _patchIndexApi.DeleteFromIndex(patchSubmittion.PatchNumber.Value);
                patchSubmittion.PatchNumber = null;
            }

            await _dbContext.SaveChangesAsync();
        }
        else if (patchSubmittion.Status == PatchSubmittionStatus.Accepted)
        {
            if (string.IsNullOrEmpty(patchSubmittion.Name))
            {
                throw new BadRequestApiException("Patch name is required to accept this");
            }

            using (var transaction = await _dbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    var patch = new PatchEntity
                    {
                        FilePath = patchSubmittion.FilePath,
                        Name = patchSubmittion.Name,
                        Description = patchSubmittion.Description,
                        PatchMaker = patchSubmittion.PatchMaker,
                        UniversityCode = patchSubmittion.UniversityCode,
                        UniversitySection = patchSubmittion.UniversitySection,
                        ReleaseDate = patchSubmittion.ReleaseDate,
                        PatchSubmissionId = patchSubmittion.Id,
                        Created = DateTime.UtcNow
                    };

                    _dbContext.Patches.Add(patch);
                    await _dbContext.SaveChangesAsync();

                    await _patchIndexApi.IndexPatch(patch.PatchNumber!.Value, patch.FilePath);

                    patchSubmittion.PatchNumber = patch.PatchNumber;
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
                await AddAcceptedPatchSubmissionToUserPatches(patchSubmittion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add accepted patch submission {Id} to user patches...", patchSubmittion.Id);
            }
        }
        else
        {
            await _dbContext.SaveChangesAsync();
        }

        return _mapper.ToPatchSubmittionResponse(patchSubmittion);
    }

    private async Task AddAcceptedPatchSubmissionToUserPatches(PatchSubmittionEntity entity)
    {
        if (!entity.PatchNumber.HasValue)
        {
            _logger.LogError("Patch submission {Id} does not have a patch number after being accepted...", entity.Id);
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

    private void ValidateCanUpdatePatch(UpdatePatchRequest request, UserEntity user, PatchSubmittionEntity patchSubmittion)
    {
        if (user.Role == UserRole.Admin || user.Role == UserRole.Moderator)
        {
            return;
        }

        if (patchSubmittion.Status == PatchSubmittionStatus.Deleted)
        {
            throw new NotFoundApiException("Patch submittion not found");
        }

        if (patchSubmittion.UploadedByUserId != user.Id)
        {
            throw new UnauthorizedApiException("You can only update your own patch submittions");
        }

        if (patchSubmittion.Status != PatchSubmittionStatus.Pending && patchSubmittion.Status != PatchSubmittionStatus.Accepted)
        {
            throw new BadRequestApiException("You cannot update this patch");
        }

        if (request.Status.HasValue && request.Status.Value != PatchSubmittionStatus.Deleted && request.Status.Value != patchSubmittion.Status)
        {
            throw new BadRequestApiException("You cannot update this patch");
        }
    }


    public async Task<PaginationResponse<PatchSubmittionResponse>> GetPendingSubmittions(int skip, int take)
    {
        skip = Math.Max(0, skip);
        take = Math.Clamp(take, 1, 50);

        var patches = await _dbContext.PatchSubmittions
            .OrderByDescending(p => p.ReleaseDate)
            .Where(p => p.Status == PatchSubmittionStatus.Pending)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        var response = new PaginationResponse<PatchSubmittionResponse>
        {
            Items = patches.Select(_mapper.ToPatchSubmittionResponse).ToList(),
            Count = await _dbContext.PatchSubmittions.CountAsync(p => p.Status == PatchSubmittionStatus.Pending)
        };

        return response;
    }

    public async Task<PatchSubmittionResponse> GetPatchSubmittion(Guid patchSubmittionId)
    {
        var patchSubmittion = await _dbContext.PatchSubmittions.FindAsync(patchSubmittionId) ?? throw new NotFoundApiException("Patch submittion not found");
        return _mapper.ToPatchSubmittionResponse(patchSubmittion);
    }
}