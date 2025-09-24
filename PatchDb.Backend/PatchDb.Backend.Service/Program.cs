using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Core;

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