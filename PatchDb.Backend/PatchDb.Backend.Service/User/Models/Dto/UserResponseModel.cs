using Newtonsoft.Json;

namespace PatchDb.Backend.Service.User.Models.Dto;

public class UserResponse
{
    [JsonProperty("id")]
    public Guid Id { get; set; }

    [JsonProperty("userState")]
    public UserState UserState { get; set; }

    [JsonProperty("role")]
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

    [JsonProperty("created")]
    public DateTime Created { get; set; }
}
