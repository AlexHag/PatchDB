using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace PatchDb.Backend.Core.Authentication.Models;

public class AccessTokenModel
{
    [JsonProperty("sessionId")]
    public Guid SessionId { get; set; }

    [JsonProperty("accessToken")]
    public required string AccessToken { get; set; }

    [JsonProperty("refreshToken")]
    public required string RefreshToken { get; set; }

    [JsonProperty("method")]
    [JsonConverter(typeof(StringEnumConverter))]
    public AuthenticationMethod Method { get; set; }

    [JsonProperty("expirationTime")]
    public DateTime ExpirationTime { get; set; }

    [JsonProperty("issuedAt")]
    public DateTime IssuedAt { get; set; }
}
