using Newtonsoft.Json;

namespace PatchDb.Backend.Service.UserPatches.Models.Dto;

public class UserPatchUploadModel
{
    [JsonProperty("userPatchUploadId")]
    public Guid UserPatchUploadId { get; set; }

    [JsonProperty("imageUrl")]
    public required string ImageUrl { get; set; }

    [JsonProperty("created")]
    public DateTime Created { get; set; }
}