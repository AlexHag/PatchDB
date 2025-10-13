
namespace PatchDb.Backend.Service.User.Models.Entities;

public class UserEntity
{
    public Guid Id { get; set; }
    public UserState UserState { get; set; }
    public UserRole Role { get; set; }

    public string? Username { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePicturePath { get; set; }

    public string? Password { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }

    public string? UniversityCode { get; set; }
    public string? UniversityProgram { get; set; }

    public int FollowingCount { get; set; }
    public int FollowersCount { get; set; }

    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }
}