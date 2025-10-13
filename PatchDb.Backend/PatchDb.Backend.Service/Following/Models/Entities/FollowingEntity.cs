using PatchDb.Backend.Service.User.Models.Entities;

namespace PatchDb.Backend.Service.Following.Models.Entities;

public class FollowingEntity
{
    public Guid Id { get; set; }
    public required UserEntity User { get; set; }
    public required UserEntity FollowingUser { get; set; }
    public DateTime Created { get; set; }
}