using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core.Exceptions;
using PatchDb.Backend.Service.Patches.Models.Dto;
using Platform.Core.Application.Persistence;

namespace PatchDb.Backend.Service.Patches;

public interface IPatchService
{
    Task<PaginationResponse<PatchResponse>> GetPatches(int skip, int take);
    Task<PatchResponse> GetPatch(int patchNumber);
    Task<PaginationResponse<PatchResponse>> SearchPatches(SearchPatchRequest request);
}

public class PatchService : IPatchService
{
    private readonly ServiceDbContext _dbContext;
    private readonly IModelMapper _mapper;

    public PatchService(
        ServiceDbContext dbContext,
        IModelMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    public async Task<PatchResponse> GetPatch(int patchNumber)
        => _mapper.ToPatchResponse(await _dbContext.Patches.FindAsync(patchNumber) ?? throw new NotFoundApiException("Patch not found"));

    public async Task<PaginationResponse<PatchResponse>> GetPatches(int skip, int take)
    {
        skip = Math.Max(0, skip);
        take = Math.Clamp(take, 1, 50);

        var patches = await _dbContext.Patches
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        var response = new PaginationResponse<PatchResponse>
        {
            Count = await _dbContext.Patches.CountAsync(),
            Items = patches.Select(_mapper.ToPatchResponse).ToList()
        };

        return response;
    }

    public async Task<PaginationResponse<PatchResponse>> SearchPatches(SearchPatchRequest request)
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
        
        var response = new PaginationResponse<PatchResponse>
        {
            Count = await query.CountAsync(),
            Items = patches.Select(_mapper.ToPatchResponse).ToList()
        };

        return response;
    }
}