using Newtonsoft.Json;

namespace PatchDb.Backend.Service.PatchSubmittion.Models.Dto;

public class UpdatePatchRequest
{
    /// <summary>
    ///     Id of the patch submittion
    /// </summary>
    [JsonProperty("id")]
    public Guid Id { get; set; }

    [JsonProperty("name")]
    public string? Name { get; set; }

    [JsonProperty("description")]
    public string? Description { get; set; }

    [JsonProperty("patchMaker")]
    public string? PatchMaker { get; set; }

    [JsonProperty("universityCode")]
    public string? UniversityCode { get; set; }

    [JsonProperty("universitySection")]
    public string? UniversitySection { get; set; }

    [JsonProperty("releaseDate")]
    public DateTime? ReleaseDate { get; set; }

    [JsonProperty("status")]
    public PatchSubmittionStatus? Status { get; set; }
}