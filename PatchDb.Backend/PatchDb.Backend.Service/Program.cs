using MapsterMapper;

using Microsoft.EntityFrameworkCore;

using PatchDb.Backend.Core;
using PatchDb.Backend.Core.Configuration;
using PatchDb.Backend.Service.Authentication;
using PatchDb.Backend.Service.FileService;
using PatchDb.Backend.Service.FileService.Configuration;
using PatchDb.Backend.Service.Patches;
using PatchDb.Backend.Service.PatchIndexApi;
using PatchDb.Backend.Service.PatchSubmittion;
using PatchDb.Backend.Service.User;

namespace PatchDb.Backend.Service;

internal static class Program
{
    public static void Main(string[] args)
        => WebApplication.CreateBuilder(args)
            .ConfigureBuilder(Name)
            .ConfigureServices()
            .Build()
            .ConfigureApp()
            .Run();
        
    public static WebApplicationBuilder ConfigureServices(this WebApplicationBuilder builder)
    {
        // builder.AddConfiguration<PasswordPolicyConfiguration>();
        // builder.AddConfiguration<EmailVerificationConfiguration>();
        // builder.AddConfiguration<PasswordResetConfiguration>();

        builder.Services.AddScoped<IMapper, Mapper>();
        builder.AddConfiguration<AwsConfiguration>();
        builder.AddConfiguration<AwsCredentials>();

        builder.RegisterPatchIndexApi();

        builder.Services.AddSingleton<IS3FileService, S3FileService>();

        builder.Services.AddScoped<IUserService, UserService>();
        builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
        builder.Services.AddScoped<IPatchService, PatchService>();
        builder.Services.AddScoped<IPatchSubmittionService, PatchSubmittionService>();

        // builder.Services.AddScoped<IUserRepository, UserRepository>();
        // builder.Services.AddScoped<IUserPasswordRepository, UserPasswordRepository>();
        // builder.Services.AddScoped<IResetPasswordReposiotry, ResetPasswordRepository>();
        // builder.Services.AddScoped<IUserSessionRepository, UserSessionRepository>();
        // builder.Services.AddScoped<IEmailVerificationRepository, EmailVerificationRepository>();

        // builder.Services.AddScoped<IUserPasswordService, UserPasswordService>();
        // builder.Services.AddScoped<IUserService, UserService>();
        // builder.Services.AddScoped<IEmailVerificationService, EmailVerificationService>();

        builder.Services.AddDbContext<ServiceDbContext>(options =>
            // options.UseSqlServer(SqlHelper.GetConnectionString(builder.Configuration)));
            options.UseSqlite("Data Source=database.db"));

        // builder.RegisterConsumer<UserCreatedEventConsumer>(Name);
        // builder.RegisterConsumer<EmailVerifiedEventConsumer>(Name);
        // builder.RegisterConsumer<EmailUpdatedEventConsumer>(Name);
        // builder.StartKafka();

        return builder;
    }
        
    private const string Name = "patchdb-backend-service";
}