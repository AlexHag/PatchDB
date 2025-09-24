
using Newtonsoft.Json;

namespace PatchDb.Backend.Service.User.Models.Dto;

public class CreateUserRequest
{
    [JsonProperty("username")]
    public string? Username { get; set; }

    [JsonProperty("email")]
    public string? Email { get; set; }

    [JsonProperty("phoneNumber")]
    public string? PhoneNumber { get; set; }

    [JsonProperty("password")]
    public string? Password { get; set; }
}