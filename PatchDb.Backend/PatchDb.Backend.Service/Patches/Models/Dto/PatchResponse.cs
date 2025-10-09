using Newtonsoft.Json;
using PatchDb.Backend.Service.Universities;

namespace PatchDb.Backend.Service.Patches.Models.Dto;

public class PatchResponse
{
    [JsonProperty("patchNumber")]
    public int PatchNumber { get; set; }

    [JsonProperty("imageUrl")]
    public required string ImageUrl { get; set; }

    [JsonProperty("name")]
    public string? Name { get; set; }

    [JsonProperty("description")]
    public string? Description { get; set; }

    [JsonProperty("patchMaker")]
    public string? PatchMaker { get; set; }

    [JsonProperty("university")]
    public UniversityModel? University { get; set; }

    [JsonProperty("universitySection")]
    public string? UniversitySection { get; set; }

    [JsonProperty("releaseDate")]
    public DateTime? ReleaseDate { get; set; }

    [JsonProperty("created")]
    public DateTime Created { get; set; }

    [JsonProperty("updated")]
    public DateTime? Updated { get; set; }
}