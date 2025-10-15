namespace PatchDb.Backend.Service.Patches.Models.Entities;

public class PatchEntity
{
    public int? PatchNumber { get; set; }
    public required string FilePath { get; set; }

    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? PatchMaker { get; set; }
    public string? UniversityCode { get; set; }
    public string? UniversitySection { get; set; }
    public DateTime? ReleaseDate { get; set; }

    public Guid PatchSubmissionId { get; set; }
    public Guid SubmittedByUserId { get; set; }

    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }
}