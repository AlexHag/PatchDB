using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core.Exceptions;
using PatchDb.Backend.Service.FileService;
using PatchDb.Backend.Service.Patches.Models.Dto;
using PatchDb.Backend.Service.Patches.Models.Entities;

namespace PatchDb.Backend.Service.Patches;

public interface IPatchService
{
    Task<PatchResponse> UpdatePatchAsync(Guid userId, UpdatePatchRequest request);
    Task<PatchResponse> GetUnclassifiedPatchAsync();
    Task<List<PatchResponse>> GetPatches(int skip, int take);
    Task<List<PatchResponse>> SearchPatches(SearchPatchRequest request);

    Task<PatchResponse> UploadPatchAsync(Guid userId, UploadPatchRequest request);
}

public class PatchService : IPatchService
{
    private readonly ServiceDbContext _dbContext;
    private readonly IS3FileService _s3FileService;
    private readonly IMapper _mapper;

    public PatchService(
        ServiceDbContext dbContext,
        IS3FileService s3FileService,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _s3FileService = s3FileService;
        _mapper = mapper;
    }

    public async Task<List<PatchResponse>> GetPatches(int skip, int take)
    {
        skip = Math.Max(0, skip);
        take = Math.Clamp(take, 1, 50);

        var patches = await _dbContext.Patches
            .OrderByDescending(p => p.ReleaseDate)
            .Where(p => p.Active)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
        
        return patches.Select(ToPatchResponse).ToList();
    }

    public async Task<List<PatchResponse>> SearchPatches(SearchPatchRequest request)
    {
        request.Skip = Math.Max(0, request.Skip);
        request.Take = Math.Clamp(request.Take, 1, 50);

        var query = _dbContext.Patches.AsQueryable();

        query = query.Where(p => p.Active);

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            query = query.Where(p => p.Name != null && EF.Functions.Like(p.Name, $"%{request.Name}%"));
        }

        if (!string.IsNullOrWhiteSpace(request.Description))
        {
            query = query.Where(p => p.Description != null && EF.Functions.Like(p.Description, $"%{request.Description}%"));
        }

        if (!string.IsNullOrWhiteSpace(request.PatchMaker))
        {
            query = query.Where(p => p.PatchMaker != null && EF.Functions.Like(p.PatchMaker, $"%{request.PatchMaker}%"));
        }

        if (!string.IsNullOrWhiteSpace(request.University))
        {
            query = query.Where(p => p.University != null && EF.Functions.Like(p.University, $"%{request.University}%"));
        }

        if (!string.IsNullOrWhiteSpace(request.UniversitySection))
        {
            query = query.Where(p => p.UniversitySection != null && EF.Functions.Like(p.UniversitySection, $"%{request.UniversitySection}%"));
        }

        var patches = await query
            .OrderByDescending(p => p.ReleaseDate)
            .Skip(request.Skip)
            .Take(request.Take)
            .ToListAsync();
        
        return patches.Select(ToPatchResponse).ToList();
    }

    public async Task<PatchResponse> GetUnclassifiedPatchAsync()
    {
        var patch = await _dbContext.Patches.FirstOrDefaultAsync(p => !p.Active);

        if (patch == null)
        {
            throw new NotFoundApiException("No unclassified patches found.");
        }

        return ToPatchResponse(patch);
    }

    public async Task<PatchResponse> UpdatePatchAsync(Guid userId, UpdatePatchRequest request)
    {
        var patch = await _dbContext.Patches.FindAsync(request.Id);

        if (patch == null)
        {
            throw new NotFoundApiException($"Patch not found");
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            patch.Active = true;
            patch.Name = request.Name;
        }

        if (!string.IsNullOrWhiteSpace(request.Description))
        {
            patch.Description = request.Description;
        }

        if (!string.IsNullOrWhiteSpace(request.PatchMaker))
        {
            patch.PatchMaker = request.PatchMaker;
        }

        if (!string.IsNullOrWhiteSpace(request.University))
        {
            patch.University = request.University;
        }

        if (!string.IsNullOrWhiteSpace(request.UniversitySection))
        {
            patch.UniversitySection = request.UniversitySection;
        }

        if (request.ReleaseDate.HasValue)
        {
            patch.ReleaseDate = request.ReleaseDate.Value;
        }

        patch.LastUpdatedByUserId = userId;

        await _dbContext.SaveChangesAsync();
        return ToPatchResponse(patch);
    }


    public async Task<PatchResponse> UploadPatchAsync(Guid userId, UploadPatchRequest request)
    {
        var path = $"patches/{request.FileId}";

        if (!await _s3FileService.FileExists(path))
        {
            throw new NotFoundApiException("File not found");
        }

        var patch = new PatchEntity
        {
            Id = Guid.NewGuid(),
            FilePath = $"patches/{request.FileId}",
            Name = request.Name,
            Description = request.Description,
            PatchMaker = request.PatchMaker,
            University = request.University,
            UniversitySection = request.UniversitySection,
            ReleaseDate = request.ReleaseDate,
            SubmittedByUserId = userId,
            LastUpdatedByUserId = userId,
            Active = false
        };

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            patch.Active = true;
        }

        _dbContext.Patches.Add(patch);
        await _dbContext.SaveChangesAsync();
        return ToPatchResponse(patch);
    }

    private PatchResponse ToPatchResponse(PatchEntity patch)
    {
        var response = _mapper.Map<PatchResponse>(patch);
        response.Url = _s3FileService.GetDownloadUrl(patch.FilePath);
        return response;
    }
}