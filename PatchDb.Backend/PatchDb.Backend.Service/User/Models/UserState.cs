using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace PatchDb.Backend.Service.User.Models;

[JsonConverter(typeof(StringEnumConverter))]
public enum UserState
{
    Unknown = 0,
    Active = 10,
    Locked = 20,
    Banned = 30,
    Deleted = 40
}