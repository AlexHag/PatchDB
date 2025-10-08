using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace PatchDb.Backend.Service.PatchSubmittion.Models.Dto;

public class PatchSubmittionResponse
{
    /// <summary>
    ///     Primary key
    /// </summary>
    [JsonProperty("id")]
    public Guid PatchSubmittionId { get; set; }

    /// <summary>
    ///     The patch number if the submittion is accepted
    /// </summary>
    [JsonProperty("patchNumber")]
    public int? PatchNumber { get; set; }

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

    /// <summary>
    ///     URL of the patch image
    /// </summary>
    [JsonProperty("imageUrl")]
    public required string ImageUrl { get; set; }

    [JsonProperty("status")]
    [JsonConverter(typeof(StringEnumConverter))]
    public PatchSubmittionStatus Status { get; set; }

    /// <summary>
    ///     UserId of the person who submitted the patch
    /// </summary>
    [JsonProperty("uploadedByUserId")]
    public Guid UploadedByUserId { get; set; }

    /// <summary>
    ///     UserId of the person who last updated the patch
    /// </summary>
    [JsonProperty("lastUpdatedByUserId")]
    public Guid? LastUpdatedByUserId { get; set; }

    [JsonProperty("created")]
    public DateTime Created { get; set; }

    [JsonProperty("updated")]
    public DateTime? Updated { get; set; }
}