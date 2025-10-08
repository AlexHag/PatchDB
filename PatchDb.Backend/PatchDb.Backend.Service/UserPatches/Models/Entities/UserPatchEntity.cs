using PatchDb.Backend.Service.Patches.Models.Entities;
using PatchDb.Backend.Service.PatchSubmittion.Models.Entities;

namespace PatchDb.Backend.Service.UserPatches.Models.Entities;

public class UserPatchEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    // The global patch
    public int PatchNumber { get; set; }
    public required PatchEntity Patch { get; set; }

    // The different uploads of this patch that the user has uploaded.
    public List<UserPatchUploadEntity> Uploads { get; set; } = [];

    public bool IsFavorite { get; set; }
    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }
}
