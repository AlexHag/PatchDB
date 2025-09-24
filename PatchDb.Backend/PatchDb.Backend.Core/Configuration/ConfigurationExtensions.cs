using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace PatchDb.Backend.Core.Configuration;

public static class ConfigurationExtensions
{
    public static WebApplicationBuilder AddConfiguration<TConfiguration>(this WebApplicationBuilder builder)
        where TConfiguration : class
    {
        var attribute = typeof(TConfiguration).GetCustomAttribute<ConfigurationAttribute>();

        if (attribute is null)
        {
            throw new Exception($"Configuration attribute not found on type {typeof(TConfiguration).Name}");
        }

        var instance = Activator.CreateInstance<TConfiguration>();

        if (attribute.Type == ConfigurationType.File)
        {
            AddFile(instance, attribute.Path, attribute.IsRequired);
        }

        if (attribute.Type == ConfigurationType.Secret)
        {
            // TODO: Configure secret manager
            AddFile(instance, attribute.Path, attribute.IsRequired);
        }

        builder.Services.AddSingleton(instance);
        return builder;
    }

    private static void AddFile<TConfiguration>(TConfiguration instance, string path, bool isRequired)
        where TConfiguration : class
    {
        var fullPath = GetFullPath(path);

        if (File.Exists(fullPath))
        {
            var configSection = new ConfigurationBuilder()
                .AddJsonFile(fullPath)
                .Build();

            configSection.Bind(instance);  
        }
        else
        {
            _ = isRequired ? throw new Exception($"Configuration file not found at {fullPath}") : 0;
        }
    }

    private static string GetFullPath(string path)
    {
        if (Environment.GetEnvironmentVariable("IS_CONTAINER_ENVIRONMENT") != null)
        {
            return Path.Combine("/app-config", $"{path}.json");
        }

        return Path.GetFullPath($"../app-config/{path}.json");
    }
}
