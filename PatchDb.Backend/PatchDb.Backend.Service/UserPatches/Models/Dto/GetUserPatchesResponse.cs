using Newtonsoft.Json;

namespace PatchDb.Backend.Service.UserPatches.Models.Dto;

public class GetUserPatchesResponse
{
    [JsonProperty("patches")]
    public List<UserPatchModel> Patches { get; set; } = [];

    [JsonProperty("unmatchesPatches")]
    public List<UserPatchUploadModel> UnmatchesPatches { get; set; } = [];
}