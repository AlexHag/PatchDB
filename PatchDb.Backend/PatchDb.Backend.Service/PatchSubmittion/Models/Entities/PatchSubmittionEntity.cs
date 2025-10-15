
namespace PatchDb.Backend.Service.PatchSubmittion.Models.Entities;

public class PatchSubmittionEntity
{
    /// <summary>
    ///     Primary key
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    ///     The patch number if the submittion is accepted
    /// </summary>
    public int? PatchNumber { get; set; }

    /// <summary>
    ///     If user uploaded an image of a patch that was not found in our database, they can choose to submit it as a new patch to our database.
    ///     This can be null if the user submits a new patch directly without going through the upload process.
    /// </summary>
    public Guid? UserPatchUploadId { get; set; }

    public required string FilePath { get; set; }

    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? PatchMaker { get; set; }

    public string? UniversityCode { get; set; }
    public string? UniversitySection { get; set; }

    public DateTime? ReleaseDate { get; set; }

    /// <summary>
    ///     Status of the patch submittion. (Pending, Accepted, Rejected, Duplicate, Deleted)
    /// </summary>
    public PatchSubmittionStatus Status { get; set; }

    public Guid UploadedByUserId { get; set; }
    public Guid? LastUpdatedByUserId { get; set; }

    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }
}