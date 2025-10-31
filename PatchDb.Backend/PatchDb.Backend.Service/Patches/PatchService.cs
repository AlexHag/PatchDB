using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core.Exceptions;
using PatchDb.Backend.Service.Patches.Models.Dto;
using Platform.Core.Application.Persistence;

namespace PatchDb.Backend.Service.Patches;

public interface IPatchService
{
    Task<PaginationResponse<PatchResponse>> GetPatches(int skip, int take, Guid requesterUserId);
    Task<PatchResponse> GetPatch(int patchNumber, Guid requesterUserId);
    Task<PaginationResponse<PatchResponse>> SearchPatches(SearchPatchRequest request, Guid requesterUserId);
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

    public async Task<PatchResponse> GetPatch(int patchNumber, Guid requesterUserId)
    {
        var response = _mapper.ToPatchResponse(await _dbContext.Patches.FindAsync(patchNumber) ?? throw new NotFoundApiException("Patch not found"));
        response.HasPatch = await _dbContext.UserPatches.AnyAsync(p => p.UserId == requesterUserId && p.PatchNumber == patchNumber);

        return response;
    }

    public async Task<PaginationResponse<PatchResponse>> GetPatches(int skip, int take, Guid requesterUserId)
    {
        skip = Math.Max(0, skip);
        take = Math.Clamp(take, 1, 50);

        var patches = await _dbContext.Patches
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        var items = patches.Select(_mapper.ToPatchResponse).ToList();
        await FetchWhichPatchesTheUserHas(items, requesterUserId);

        var response = new PaginationResponse<PatchResponse>
        {
            Count = await _dbContext.Patches.CountAsync(),
            Items = items
        };

        return response;
    }

    public async Task<PaginationResponse<PatchResponse>> SearchPatches(SearchPatchRequest request, Guid requesterUserId)
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

        var items = patches.Select(_mapper.ToPatchResponse).ToList();
        await FetchWhichPatchesTheUserHas(items, requesterUserId);

        var response = new PaginationResponse<PatchResponse>
        {
            Count = await _dbContext.Patches.CountAsync(),
            Items = items
        };

        return response;
    }

    private async Task FetchWhichPatchesTheUserHas(List<PatchResponse> items, Guid requesterUserId)
    {
        var patchNumbers = items.Select(p => p.PatchNumber).ToList();

        var userPatchNumbers = await _dbContext.UserPatches
            .Where(up => up.UserId == requesterUserId && patchNumbers.Contains(up.PatchNumber))
            .Select(up => up.PatchNumber)
            .ToListAsync();

        foreach (var item in items)
        {
            item.HasPatch = userPatchNumbers.Contains(item.PatchNumber);
        }
    }
}