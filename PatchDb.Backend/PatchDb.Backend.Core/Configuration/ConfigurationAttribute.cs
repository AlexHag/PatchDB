namespace PatchDb.Backend.Core.Configuration;

[AttributeUsage(AttributeTargets.Class)]
public class ConfigurationAttribute : Attribute
{
    public string Path { get; }

    public ConfigurationType Type { get; set; }
    public bool IsRequired { get; set; }

    public ConfigurationAttribute(string path)
    {
        Path = path;
        Type = ConfigurationType.File;
        IsRequired = true;
    }
}
