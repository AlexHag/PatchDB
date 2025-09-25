using PatchDb.Backend.Core.Configuration;

namespace PatchDb.Backend.Service.FileService.Configuration;

[Configuration("aws-credentials", IsRequired = false, Type = ConfigurationType.Secret)]
public class AwsCredentials
{
    public string? AccessKey { get; set; }
    public string? SecretAccessKey { get; set; }
}