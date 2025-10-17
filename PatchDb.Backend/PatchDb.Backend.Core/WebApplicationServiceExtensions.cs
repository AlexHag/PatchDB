using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using PatchDb.Backend.Core.Authentication;
using PatchDb.Backend.Core.Exceptions;
using System.Text.Json.Serialization;
using PatchDb.Backend.Core.Elastic;

namespace PatchDb.Backend.Core;

public static class WebApplicationServiceExtensions
{
    public static WebApplicationBuilder ConfigureBuilder(this WebApplicationBuilder builder, string name = "PatchDB")
    {
        builder.Configuration.AddUserSecrets(Assembly.GetCallingAssembly());
        builder.AddLoggingToElastic();

        // builder.AddCryptography();
        builder.AddJwtAuthentication();
        // builder.AddMtlsAuthentication();

        // builder.Services.AddSingleton<IRestApiClientManager, RestApiClientManager>();

        builder.Services
            .AddControllers()
            .AddControllersAsServices()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

        builder.AddSwagger(name);

        return builder;
    }

    public static WebApplication ConfigureApp(this WebApplication app)
    {
        app.UseMiddleware<RestApiExceptionMiddleware>();

        // if (app.Environment.IsDevelopment())
        // {
            app.UseSwagger();
            app.UseSwaggerUI();
        // }

        app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:3000"));

        app.UseHttpsRedirection();
        app.UseAuthentication();

        app.UseRouting();
        app.UseAuthorization();

        app.MapControllers();

        return app;
    }

    private static WebApplicationBuilder AddSwagger(this WebApplicationBuilder builder, string name)
    {
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(option =>
        {
            option.SwaggerDoc("v1", new OpenApiInfo { Title = name, Version = "v1" });
            option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter a valid token",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme = "Bearer"
            });
            option.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type=ReferenceType.SecurityScheme,
                            Id="Bearer"
                        }
                    },
                    new string[]{}
                }
            });
        });

        return builder;
    }
}