namespace PatchDb.Backend.Service.PatchIndexApi;

public static class PatchIndexApiModule
{
    public static WebApplicationBuilder RegisterPatchIndexApi(this WebApplicationBuilder builder)
    {
        // TODO: Configure better
        builder.Services.AddHttpClient("patch-index-api", (services, client) =>
        {
            client.BaseAddress = new Uri("http://localhost:5000");
        });

        builder.Services.AddScoped<IPatchIndexingApi, PatchIndexingApi>();
        return builder;
    }
}