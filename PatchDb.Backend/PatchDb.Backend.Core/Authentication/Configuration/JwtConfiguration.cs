using PatchDb.Backend.Core.Configuration;

namespace PatchDb.Backend.Core.Authentication.Configuration;

[Configuration("jwt-config", IsRequired = false)]
internal class JwtConfiguration
{
    public string? Issuer { get; set; }
    public string? Audience { get; set; }
}
