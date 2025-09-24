using System.Text.Json.Serialization;

namespace PatchDb.Backend.Core.Configuration;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ConfigurationType
{
    File = 1,
    Secret = 2
}