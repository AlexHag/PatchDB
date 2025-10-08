
using Newtonsoft.Json;
using PatchDb.Backend.Service.Patches.Models.Dto;

namespace PatchDb.Backend.Service.UserPatches.Models.Dto;

public class UserPatchModel
{
    [JsonProperty("userPatchId")]
    public Guid UserPatchId { get; set; }

    /// <summary>
    ///     The global patch
    /// </summary>
    [JsonProperty("matchingPatch")]
    public required PatchResponse MatchingPatch { get; set; }

    /// <summary>
    ///     The different uploads of this patch that the user has uploaded.
    /// </summary>
    [JsonProperty("uploads")]
    public required List<UserPatchUploadModel> Uploads { get; set; }

    [JsonProperty("isFavorite")]
    public bool IsFavorite { get; set; }

    [JsonProperty("aquiredAt")]
    public DateTime AquiredAt { get; set; }
}