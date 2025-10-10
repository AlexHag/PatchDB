using Newtonsoft.Json;

namespace PatchDb.Backend.Service.User.Models.Dto;

public class SearchUserRequest
{
    [JsonProperty("username")]
    public string? Username { get; set; }

    [JsonProperty("universityCode")]
    public string? UniversityCode { get; set; }

    [JsonProperty("skip")]
    public int Skip { get; set; } = 0;

    [JsonProperty("take")]
    public int Take { get; set; } = 20;
}