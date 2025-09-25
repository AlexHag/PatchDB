using Newtonsoft.Json;

namespace PatchDb.Backend.Service.Patches.Models.Dto;

public class UpdatePatchRequest
{
    [JsonProperty("id")]
    public Guid Id { get; set; }

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

    [JsonProperty("releaseDate")]
    public DateTime? ReleaseDate { get; set; }
}