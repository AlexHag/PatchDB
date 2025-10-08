using Newtonsoft.Json;
using PatchDb.Backend.Service.Patches.Models.Dto;

namespace PatchDb.Backend.Service.UserPatches.Models.Dto;

public class PatchUploadResponse
{
    /// <summary>
    ///     Patches that matches the uploaded patch that the user already owns.
    /// </summary>
    [JsonProperty("ownedMatchingPatches")]
    public List<OwnedMatchingPatchesModel> OwnedMatchingPatches { get; set; } = [];

    /// <summary>
    ///     "Global" patches that matches the uploaded patch which the user does not own yet.
    /// </summary>
    [JsonProperty("newMatchingPatches")]
    public List<NewMatchingPatchesModel> NewMatchingPatches { get; set; } = [];

    /// <summary>
    ///     The uploaded patch.
    /// </summary>
    [JsonProperty("upload")]
    public required UserPatchUploadModel Upload { get; set; }
}

public class OwnedMatchingPatchesModel : UserPatchModel
{
    [JsonProperty("similarity")]
    public decimal Similarity { get; set; }
}

public class NewMatchingPatchesModel : PatchResponse
{
    [JsonProperty("similarity")]
    public decimal Similarity { get; set; }
}