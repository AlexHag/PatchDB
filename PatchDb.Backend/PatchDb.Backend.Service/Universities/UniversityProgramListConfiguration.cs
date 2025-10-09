using Newtonsoft.Json;
using PatchDb.Backend.Core.Configuration;

namespace PatchDb.Backend.Service.Universities;

[Configuration("university-program-list", IsRequired = false)]
public class UniversityProgramListConfiguration
{
    [JsonProperty("universities")]
    public required Dictionary<string, UniversityAndProgramModel> Universities { get; set; }
}