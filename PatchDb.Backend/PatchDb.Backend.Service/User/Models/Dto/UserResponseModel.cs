using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace PatchDb.Backend.Service.User.Models.Dto;

public class UserResponse
{
    [JsonProperty("id")]
    public Guid Id { get; set; }

    [JsonProperty("userState")]
    [JsonConverter(typeof(StringEnumConverter))]
    public UserState UserState { get; set; }

    [JsonProperty("role")]
    [JsonConverter(typeof(StringEnumConverter))]
    public UserRole Role { get; set; }

    [JsonProperty("username")]
    public string? Username { get; set; }

    [JsonProperty("bio")]
    public string? Bio { get; set; }

    [JsonProperty("profilePictureUrl")]
    public string? ProfilePictureUrl { get; set; }

    [JsonProperty("email")]
    public string? Email { get; set; }

    [JsonProperty("phoneNumber")]
    public string? PhoneNumber { get; set; }

    [JsonProperty("universityName")]
    public string? UniversityName { get; set; }

    [JsonProperty("universityLogoUrl")]
    public string? UniversityLogoUrl { get; set; }

    [JsonProperty("universityProgram")]
    public string? UniversityProgram { get; set; }

    [JsonProperty("created")]
    public DateTime Created { get; set; }
}
