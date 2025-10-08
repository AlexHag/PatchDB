using Newtonsoft.Json;

namespace PatchDb.Backend.Service.PatchIndexApi.Models.Dto;

public class SearchPatchApiResponse : PatchIndexBaseApiResponse
{
    /// <summary>
    ///     List of matching patches
    /// </summary>
    [JsonProperty("matches")]
    public List<PatchMatch> Matches { get; set; } = [];

    public class PatchMatch
    {
        /// <summary>
        ///     Patch number
        /// </summary>
        [JsonProperty("id")]
        public int Id { get; set; }

        /// <summary>
        ///     Similarity score (0-1)
        /// </summary>
        [JsonProperty("score")]
        public decimal Score { get; set; }
    }
}