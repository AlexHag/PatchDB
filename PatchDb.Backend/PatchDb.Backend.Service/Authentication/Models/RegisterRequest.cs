using Newtonsoft.Json;

namespace PatchDb.Backend.Service.Authentication.Models;

public class RegisterRequest
{
    [JsonProperty("username")]
    public required string Username { get; set; }

    [JsonProperty("password")]
    public required string Password { get; set; }
}