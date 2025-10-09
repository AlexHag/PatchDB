using Newtonsoft.Json;

namespace PatchDb.Backend.Service.User.Models.Dto;

public class UpdateUserUniversityInfoRequest
{
    [JsonProperty("universityCode")]
    public string? UniversityCode { get; set; }

    [JsonProperty("universityProgram")]
    public string? UniversityProgram { get; set; }
}