using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using PatchDb.Backend.Core.Authentication.Configuration;
using PatchDb.Backend.Core.Configuration;

namespace PatchDb.Backend.Core.Authentication;

public static class JwtAuthenticationServiceExtension
{
    public static WebApplicationBuilder AddJwtAuthentication(this WebApplicationBuilder builder)
    {
        var certificate = GetJwtCert();

        if (certificate == null)
        {
            Console.WriteLine("Warning: JWT Certificate not found, skipping JWT authentication setup.");
            return builder;
        }

        builder.AddConfiguration<JwtConfiguration>();
        var config = builder.Services.BuildServiceProvider().GetRequiredService<JwtConfiguration>();

        if (certificate.HasPrivateKey)
        {
            var tokenService = new TokenService(config, certificate);
            builder.Services.AddSingleton<ITokenService>(tokenService);
        }

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidIssuer = config.Issuer,
                ValidAudience = config.Audience,
                IssuerSigningKey = new X509SecurityKey(certificate),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true
            };
        });

        builder.Services.AddAuthorization();

        return builder;
    }

    public static X509Certificate2? GetJwtCert()
    {
        var pemPath = "../certificates/jwt_cert.pem";
        var pfxPath = "../certificates/jwt_cert.pfx";
        var password = "password";

        if (Environment.GetEnvironmentVariable("IS_CONTAINER_ENVIRONMENT") != null)
        {
            pemPath = "/certificates/jwt_cert.pem";
            pfxPath = "/certificates/jwt_cert.pfx";
            password = Environment.GetEnvironmentVariable("JWT_CERT_PASSWORD");
        }

        if (File.Exists(pfxPath))
        {
            return new X509Certificate2(pfxPath, password);
        }

        if (File.Exists(pemPath))
        {
            return new X509Certificate2(pemPath);
        }

        return null;
    }
}