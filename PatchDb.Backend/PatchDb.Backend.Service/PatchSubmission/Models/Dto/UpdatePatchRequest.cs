using Newtonsoft.Json;

namespace PatchDb.Backend.Service.PatchSubmission.Models.Dto;

public class UpdatePatchRequest
{
    /// <summary>
    ///     Id of the patch submission
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
    public PatchSubmissionStatus? Status { get; set; }
}