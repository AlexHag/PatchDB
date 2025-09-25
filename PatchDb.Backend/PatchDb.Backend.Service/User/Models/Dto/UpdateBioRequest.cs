using Newtonsoft.Json;

namespace PatchDb.Backend.Service.User.Models.Dto;

public class UpdateBioRequest
{
    [JsonProperty("bio")]
    public string? Bio { get; set; }
}