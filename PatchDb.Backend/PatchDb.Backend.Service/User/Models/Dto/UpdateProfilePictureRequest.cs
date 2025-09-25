using Newtonsoft.Json;

namespace PatchDb.Backend.Service.User.Models.Dto;

public class UpdateProfilePictureRequest
{
    [JsonProperty("fileId")]
    public Guid FileId { get; set; }
}