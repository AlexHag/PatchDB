using Newtonsoft.Json;

namespace PatchDb.Backend.Service.PatchSubmittion.Models.Dto;

public class UploadPatchRequest
{
    [JsonProperty("fileId")]
    public Guid FileId { get; set; }

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