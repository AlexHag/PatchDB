using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace PatchDb.Backend.Service.User.Models;

[JsonConverter(typeof(StringEnumConverter))]
public enum UserRole
{
    Unknown = 0,

    User = 10, // Student

    PatchMaker = 20, // Sektioner, Event Maker

    Moderator = 30, // Accepts patch makers

    Admin = 40
}