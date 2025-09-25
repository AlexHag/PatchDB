using System.Net;

namespace PatchDb.Backend.Core.Exceptions;

public class ForbiddenApiException : RestApiException
{
    private const string _errorId = "default-forbidden-error-id";

    public ForbiddenApiException(string message) : base(_errorId, message, HttpStatusCode.Forbidden)
    { }

    public ForbiddenApiException(string message, object errorResponse) : base(_errorId, message, errorResponse, HttpStatusCode.Forbidden)
    { }

    public ForbiddenApiException(string errorId, string message) : base(errorId, message, HttpStatusCode.Forbidden)
    { }

    public ForbiddenApiException(string errorId, string? message, object errorResponse) : base(errorId, message, errorResponse, HttpStatusCode.Forbidden)
    { }
}