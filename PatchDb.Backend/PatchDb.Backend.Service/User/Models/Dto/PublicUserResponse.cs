using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using PatchDb.Backend.Service.Universities;

namespace PatchDb.Backend.Service.User.Models.Dto;

public class PublicUserResponse
{
    [JsonProperty("id")]
    public Guid Id { get; set; }

    [JsonProperty("role")]
    [JsonConverter(typeof(StringEnumConverter))]
    public UserRole Role { get; set; }

    [JsonProperty("username")]
    public string? Username { get; set; }

    [JsonProperty("bio")]
    public string? Bio { get; set; }

    [JsonProperty("profilePictureUrl")]
    public string? ProfilePictureUrl { get; set; }

    [JsonProperty("university")]
    public UniversityModel? University { get; set; }

    [JsonProperty("universityProgram")]
    public string? UniversityProgram { get; set; }

    [JsonProperty("followingCount")]
    public int FollowingCount { get; set; }

    [JsonProperty("followersCount")]
    public int FollowersCount { get; set; }

    [JsonProperty("isFollowing")]
    public bool? IsFollowing { get; set; }

    [JsonProperty("created")]
    public DateTime Created { get; set; }
}