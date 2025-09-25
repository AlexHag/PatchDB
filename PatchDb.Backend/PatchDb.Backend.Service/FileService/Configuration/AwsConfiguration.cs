using PatchDb.Backend.Core.Configuration;

namespace PatchDb.Backend.Service.FileService.Configuration;

[Configuration("aws-config", IsRequired = false)]
public class AwsConfiguration
{
    public string? BucketName { get; set; }
    public string? Region { get; set; }
}