using Newtonsoft.Json;

namespace PatchDb.Backend.Service.PatchIndexApi.Models.Dto;

public class PatchIndexBaseApiResponse
{
    /// <summary>
    ///     API response status. Either "success" or "error".
    /// </summary>
    [JsonProperty("status")]
    public required string Status { get; set; }

    /// <summary>
    ///     Error message
    /// </summary>
    [JsonProperty("error")]
    public string? Error { get; set; }
}