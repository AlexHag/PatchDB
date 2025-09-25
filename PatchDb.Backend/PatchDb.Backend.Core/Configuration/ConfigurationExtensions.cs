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
            AddFile(instance, GetConfigPath(attribute.Path), attribute.IsRequired);
        }

        if (attribute.Type == ConfigurationType.Secret)
        {
            // TODO: Configure secret manager
            AddFile(instance, GetSecretsPath(attribute.Path), attribute.IsRequired);
        }

        builder.Services.AddSingleton(instance);
        return builder;
    }

    private static void AddFile<TConfiguration>(TConfiguration instance, string path, bool isRequired)
        where TConfiguration : class
    {
        if (File.Exists(path))
        {
            var configSection = new ConfigurationBuilder()
                .AddJsonFile(path)
                .Build();

            configSection.Bind(instance);  
        }
        else
        {
            _ = isRequired ? throw new Exception($"Configuration file not found at {path}") : 0;
        }
    }

    private static string GetConfigPath(string path)
    {
        if (Environment.GetEnvironmentVariable("IS_CONTAINER_ENVIRONMENT") != null)
        {
            return Path.Combine("/app-config", $"{path}.json");
        }

        return Path.GetFullPath($"../app-config/{path}.json");
    }

    private static string GetSecretsPath(string path)
    {
        if (Environment.GetEnvironmentVariable("IS_CONTAINER_ENVIRONMENT") != null)
        {
            return Path.Combine("/app-secrets", $"{path}.json");
        }

        return Path.GetFullPath($"../app-secrets/{path}.json");
    }
}
