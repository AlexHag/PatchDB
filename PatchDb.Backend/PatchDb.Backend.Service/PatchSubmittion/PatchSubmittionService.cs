using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core.Exceptions;
using PatchDb.Backend.Service.FileService;
using PatchDb.Backend.Service.Patches.Models.Entities;
using PatchDb.Backend.Service.PatchIndexApi;
using PatchDb.Backend.Service.PatchSubmittion.Models;
using PatchDb.Backend.Service.PatchSubmittion.Models.Dto;
using PatchDb.Backend.Service.PatchSubmittion.Models.Entities;

namespace PatchDb.Backend.Service.PatchSubmittion;

public interface IPatchSubmittionService
{
    Task<PatchSubmittionResponse> UploadPatch(Guid userId, UploadPatchRequest request);
    Task<PatchSubmittionResponse> UpdatePatch(Guid userId, UpdatePatchRequest request);
    Task<List<PatchSubmittionResponse>> GetPendingSubmittions(int skip, int take);
}

public class PatchSubmittionService : IPatchSubmittionService
{
    private readonly ServiceDbContext _dbContext;
    private readonly IS3FileService _s3FileService;
    private readonly IPatchIndexingApi _patchIndexingApi;
    private readonly IMapper _mapper;

    public PatchSubmittionService(
        ServiceDbContext dbContext,
        IS3FileService s3FileService,
        IPatchIndexingApi patchIndexingApi,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _s3FileService = s3FileService;
        _patchIndexingApi = patchIndexingApi;
        _mapper = mapper;
    }

    public async Task<PatchSubmittionResponse> UploadPatch(Guid userId, UploadPatchRequest request)
    {
        var path = $"patches/{request.FileId}";

        if (!await _s3FileService.FileExists(path))
        {
            throw new NotFoundApiException("File not found");
        }

        var entity = new PatchSubmittionEntity
        {
            Id = Guid.NewGuid(),
            FilePath = path,
            Name = request.Name,
            Description = request.Description,
            PatchMaker = request.PatchMaker,
            University = request.University,
            UniversitySection = request.UniversitySection,
            ReleaseDate = request.ReleaseDate,
            Status = PatchSubmittionStatus.Pending,
            UploadedByUserId = userId,
            Created = DateTime.UtcNow
        };

        _dbContext.PatchSubmittions.Add(entity);
        await _dbContext.SaveChangesAsync();

        return ToPatchSubmittionResponse(entity);
    }

    public async Task<PatchSubmittionResponse> UpdatePatch(Guid userId, UpdatePatchRequest request)
    {
        var patchSubmittion = await _dbContext.PatchSubmittions.FindAsync(request.Id);

        if (patchSubmittion == null)
        {
            throw new NotFoundApiException("Patch submittion not found");
        }

        if (patchSubmittion.Status != PatchSubmittionStatus.Pending)
        {
            throw new BadRequestApiException("Only pending patch submittions can be updated");
        }

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

        if (!string.IsNullOrWhiteSpace(request.University))
        {
            patchSubmittion.University = request.University;
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

        if (patchSubmittion.Status == PatchSubmittionStatus.Accepted)
        {
            if (string.IsNullOrEmpty(patchSubmittion.Name))
            {
                throw new BadRequestApiException("Patch name is required to accept this");
            }

            var patch = new PatchEntity
            {
                FilePath = patchSubmittion.FilePath,
                Name = patchSubmittion.Name,
                Description = patchSubmittion.Description,
                PatchMaker = patchSubmittion.PatchMaker,
                University = patchSubmittion.University,
                UniversitySection = patchSubmittion.UniversitySection,
                ReleaseDate = patchSubmittion.ReleaseDate,
                PatchSubmittionId = patchSubmittion.Id,
                Created = DateTime.UtcNow
            };

            _dbContext.Patches.Add(patch);
            await _dbContext.SaveChangesAsync();

            await _patchIndexingApi.IndexPatch(patch.PatchNumber!.Value, patch.FilePath);

            patchSubmittion.PatchNumber = patch.PatchNumber;
            await _dbContext.SaveChangesAsync();
        }
        else
        {
            await _dbContext.SaveChangesAsync();
        }

        return ToPatchSubmittionResponse(patchSubmittion);
    }

    public async Task<List<PatchSubmittionResponse>> GetPendingSubmittions(int skip, int take)
    {
        skip = Math.Max(0, skip);
        take = Math.Clamp(take, 1, 50);

        var patches = await _dbContext.PatchSubmittions
            .OrderByDescending(p => p.ReleaseDate)
            .Where(p => p.Status == PatchSubmittionStatus.Pending)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        return patches.Select(ToPatchSubmittionResponse).ToList();
    }

    private PatchSubmittionResponse ToPatchSubmittionResponse(PatchSubmittionEntity entity)
    {
        var response = _mapper.Map<PatchSubmittionResponse>(entity);
        response.ImageUrl = _s3FileService.GetDownloadUrl(entity.FilePath);
        return response;
    }
}