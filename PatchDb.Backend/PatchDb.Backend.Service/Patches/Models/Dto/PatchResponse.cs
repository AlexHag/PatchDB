using Newtonsoft.Json;

namespace PatchDb.Backend.Service.Patches.Models.Dto;

public class PatchResponse
{
    [JsonProperty("id")]
    public Guid Id { get; set; }

    [JsonProperty("url")]
    public required string Url { get; set; }

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

    [JsonProperty("active")]
    public bool Active { get; set; }

    [JsonProperty("created")]
    public DateTime Created { get; set; }

    [JsonProperty("updated")]
    public DateTime? Updated { get; set; }
}