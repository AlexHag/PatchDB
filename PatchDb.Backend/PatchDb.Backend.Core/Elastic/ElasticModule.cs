using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using PatchDb.Backend.Core.Configuration;
using PatchDb.Backend.Core.Elastic.Configuration;
using Serilog;
using Serilog.Exceptions;
using Serilog.Exceptions.Core;
using Serilog.Sinks.Elasticsearch;

namespace PatchDb.Backend.Core.Elastic;

public static class ElasticModule
{
    public static WebApplicationBuilder AddLoggingToElastic(this WebApplicationBuilder builder)
    {
        builder.AddConfiguration<ElasticConfiguration>();
        builder.AddConfiguration<ElasticCredentials>();

        var config = builder.Services.BuildServiceProvider().GetRequiredService<ElasticConfiguration>();
        var credentials = builder.Services.BuildServiceProvider().GetRequiredService<ElasticCredentials>();

        if (config.Uri == null || credentials.Username == null || credentials.Password == null)
        {
            Console.WriteLine("Failed to retrieve Elastic configuration or credentials, logs will not be sent to Elastic...");
            return builder;
        }

        builder.Host.UseSerilog((ctx, cfg) =>
            cfg.ReadFrom.Configuration(builder.Configuration)
            .Enrich.WithExceptionDetails(new DestructuringOptionsBuilder().WithDefaultDestructurers()
                .WithIgnoreStackTraceAndTargetSiteExceptionFilter()
                .WithoutReflectionBasedDestructurer())
            .WriteTo.Async(c => c.Elasticsearch(new ElasticsearchSinkOptions(new Uri(config.Uri!))
            {
                ModifyConnectionSettings = c => c.BasicAuthentication(credentials.Username, credentials.Password),
            }))
            .WriteTo.Async(c => c.Console()));

        return builder;
    }
}