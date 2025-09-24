using System.Security.Claims;

namespace PatchDb.Backend.Core.Authentication;

public static class UserClaimsExtensions
{
    public static Guid UserId(this ClaimsPrincipal user)
    {
        if (!Guid.TryParse(user.FindFirstValue("userId"), out var userId))
        {
            throw new InvalidOperationException("User is not logged in");
        }

        return userId;
    }
}