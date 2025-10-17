using PatchDb.Backend.Core.Configuration;

namespace PatchDb.Backend.Core.Elastic.Configuration;

[Configuration("elastic-credentials", IsRequired = false, Type = ConfigurationType.Secret)]
internal class ElasticCredentials
{
    public string? Username { get; set; }
    public string? Password { get; set; }
}
