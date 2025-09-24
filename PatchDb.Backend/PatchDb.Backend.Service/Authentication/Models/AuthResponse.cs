using Newtonsoft.Json;
using PatchDb.Backend.Core.Authentication.Models;
using PatchDb.Backend.Service.User.Models.Dto;

namespace PatchDb.Backend.Service.Authentication.Models;

public class AuthResponse
{
    [JsonProperty("user")]
    public required UserResponse User { get; set; }

    [JsonProperty("credentials")]
    public required AccessTokenModel Credentials { get; set; }
}