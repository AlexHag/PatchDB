
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

    public required string FilePath { get; set; }

    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? PatchMaker { get; set; }
    public string? University { get; set; }
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