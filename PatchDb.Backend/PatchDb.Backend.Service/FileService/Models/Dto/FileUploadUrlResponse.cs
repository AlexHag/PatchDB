namespace PatchDb.Backend.Service.FileService.Models.Dto;

public class FileUploadUrlResponse
{
    public Guid FileId { get; set; }
    public required string Url { get; set; }
}