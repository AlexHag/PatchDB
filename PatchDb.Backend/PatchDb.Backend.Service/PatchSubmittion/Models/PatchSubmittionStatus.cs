using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace PatchDb.Backend.Service.PatchSubmittion.Models;

[JsonConverter(typeof(StringEnumConverter))]
public enum PatchSubmittionStatus
{
    Unknown = 0,

    /// <summary>
    ///     The submitted patch is pending information about the patch to be provided or a review from a moderator
    /// </summary>
    Pending = 10,

    /// <summary>
    ///     The submitted patch was accepted and added to the patch index
    /// </summary>
    Accepted = 20,

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