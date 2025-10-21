using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace PatchDb.Backend.Service.PatchSubmission.Models;

[JsonConverter(typeof(StringEnumConverter))]
public enum PatchSubmissionStatus
{
    Unknown = 0,

    /// <summary>
    ///     The submitted patch is unpublished, usually means more information about the patch is required.
    /// </summary>
    Unpublished = 10,

    /// <summary>
    ///     The submitted patch was published and added to the patch index
    /// </summary>
    Published = 20,

    /// <summary>
    ///     The submitted patch was rejected
    /// </summary>
    Rejected = 30,

    /// <summary>
    ///     The submitted patch was marked as a duplicate
    /// </summary>
    Duplicate = 40,

    /// <summary>
    ///     The submitted patch was deleted by the uploader
    /// </summary>
    Deleted = 50
}