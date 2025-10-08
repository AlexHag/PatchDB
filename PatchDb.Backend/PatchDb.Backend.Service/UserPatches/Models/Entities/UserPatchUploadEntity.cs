namespace PatchDb.Backend.Service.UserPatches.Models.Entities;

public class UserPatchUploadEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public required string FilePath { get; set; }

    // The user patch this upload belongs to, can be null if the upload did not match any existing patches or if the user never selected what patch it was matching.
    public Guid? UserPatchId { get; set; }
    public UserPatchEntity? UserPatch { get; set; }
    
    public DateTime Created { get; set; }
}
