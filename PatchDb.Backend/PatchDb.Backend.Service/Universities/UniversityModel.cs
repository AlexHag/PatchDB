using Newtonsoft.Json;

namespace PatchDb.Backend.Service.Universities;

public class UniversityAndProgramModel : UniversityModel
{
    [JsonProperty("programs")]
    public required List<UniversityProgramModel> Programs { get; set; }
}

public class UniversityModel
{
    [JsonProperty("code")]
    public required string Code { get; set; }

    [JsonProperty("name")]
    public required string Name { get; set; }

    [JsonProperty("logoUrl")]
    public required string LogoUrl { get; set; }
}

public class UniversityProgramModel
{
    [JsonProperty("frontendName")]
    public required string FrontendName { get; set; }

    [JsonProperty("name")]
    public required string Name { get; set; }
}
