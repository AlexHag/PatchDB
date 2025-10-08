using Newtonsoft.Json;

using PatchDb.Backend.Service.FileService;
using PatchDb.Backend.Service.PatchIndexApi.Models.Dto;

namespace PatchDb.Backend.Service.PatchIndexApi;

public interface IPatchIndexApi
{
    Task IndexPatch(int id, string path);
    Task DeleteFromIndex(int id);
    Task<SearchPatchApiResponse> SearchPatch(string path);
}

public class PatchIndexApi : IPatchIndexApi
{
    private readonly IS3FileService _s3FileService;
    private readonly HttpClient _httpClient;

    public PatchIndexApi(
        IS3FileService s3FileService,
        IHttpClientFactory httpClientFactory)
    {
        _s3FileService = s3FileService;
        _httpClient = httpClientFactory.CreateClient("patch-index-api");
    }

    public async Task IndexPatch(int id, string path)
    {
        if (!await _s3FileService.FileExists(path))
        {
            throw new Exception("File does not exist");
        }

        using var stream = new MemoryStream();
        await _s3FileService.DownloadFile(path, stream);

        var content = new MultipartFormDataContent
        {
            { new StringContent(id.ToString()), "id" },
            { new StreamContent(stream), "image", "file-name-placeholder" }
        };

        var response = await _httpClient.PostAsync("/index", content);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Failed to index patch. Status code: {response.StatusCode}");
        }
    }

    public async Task DeleteFromIndex(int id)
    {
        var response = await _httpClient.DeleteAsync($"/index/{id}");

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Failed to delete patch. Status code: {response.StatusCode}");
        }
    }

    public async Task<SearchPatchApiResponse> SearchPatch(string path)
    {
        if (!await _s3FileService.FileExists(path))
        {
            throw new Exception("File does not exist");
        }

        using var stream = new MemoryStream();
        await _s3FileService.DownloadFile(path, stream);

        var content = new MultipartFormDataContent
        {
            { new StreamContent(stream), "image", "file-name-placeholder" }
        };

        var response = await _httpClient.PostAsync("/search", content);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Failed to search patch. Status code: {response.StatusCode}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<SearchPatchApiResponse>(responseContent);
    }
}