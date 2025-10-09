using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core.Exceptions;
using PatchDb.Backend.Service.FileService;
using PatchDb.Backend.Service.Patches.Models.Dto;
using PatchDb.Backend.Service.Patches.Models.Entities;
using PatchDb.Backend.Service.Universities;

namespace PatchDb.Backend.Service.Patches;

public interface IPatchService
{
    Task<List<PatchResponse>> GetPatches(int skip, int take);
    Task<PatchResponse> GetPatch(int patchNumber);
    Task<List<PatchResponse>> SearchPatches(SearchPatchRequest request);
}

public class PatchService : IPatchService
{
    private readonly ServiceDbContext _dbContext;
    private readonly IS3FileService _s3FileService;
    private readonly IUniversityService _universityService;
    private readonly IMapper _mapper;

    public PatchService(
        ServiceDbContext dbContext,
        IS3FileService s3FileService,
        IUniversityService universityService,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _s3FileService = s3FileService;
        _universityService = universityService;
        _mapper = mapper;
    }

    public async Task<PatchResponse> GetPatch(int patchNumber)
        => ToPatchResponse(await _dbContext.Patches.FindAsync(patchNumber) ?? throw new NotFoundApiException("Patch not found"));

    public async Task<List<PatchResponse>> GetPatches(int skip, int take)
    {
        skip = Math.Max(0, skip);
        take = Math.Clamp(take, 1, 50);

        var patches = await _dbContext.Patches
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

        if (!string.IsNullOrWhiteSpace(request.UniversityCode))
        {
            query = query.Where(p => p.UniversityCode == request.UniversityCode);
        }

        if (!string.IsNullOrWhiteSpace(request.UniversitySection))
        {
            query = query.Where(p => p.UniversitySection != null && EF.Functions.Like(p.UniversitySection, $"%{request.UniversitySection}%"));
        }

        var patches = await query
            .Skip(request.Skip)
            .Take(request.Take)
            .ToListAsync();
        
        return patches.Select(ToPatchResponse).ToList();
    }

    private PatchResponse ToPatchResponse(PatchEntity patch)
    {
        var response = _mapper.Map<PatchResponse>(patch);
        response.ImageUrl = _s3FileService.GetDownloadUrl(patch.FilePath);

        if (!string.IsNullOrWhiteSpace(patch.UniversityCode))
        {
            response.University = _universityService.GetUniversity(patch.UniversityCode);
        }

        return response;
    }
}