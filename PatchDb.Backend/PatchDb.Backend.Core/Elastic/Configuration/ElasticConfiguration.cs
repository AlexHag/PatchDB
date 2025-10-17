using PatchDb.Backend.Core.Configuration;

namespace PatchDb.Backend.Core.Elastic.Configuration;

[Configuration("elastic-config", IsRequired = false)]
internal class ElasticConfiguration
{
    public string? Uri { get; set; }
}
