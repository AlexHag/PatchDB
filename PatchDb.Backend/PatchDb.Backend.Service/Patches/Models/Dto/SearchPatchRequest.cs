using Newtonsoft.Json;

namespace PatchDb.Backend.Service.Patches.Models.Dto;

public class SearchPatchRequest
{
    [JsonProperty("name")]
    public string? Name { get; set; }

    [JsonProperty("description")]
    public string? Description { get; set; }

    [JsonProperty("patchMaker")]
    public string? PatchMaker { get; set; }

    [JsonProperty("university")]
    public string? University { get; set; }

    [JsonProperty("universitySection")]
    public string? UniversitySection { get; set; }

    [JsonProperty("skip")]
    public int Skip { get; set; } = 0;

    [JsonProperty("take")]
    public int Take { get; set; } = 20;
}