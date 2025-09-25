using System.Net;

namespace PatchDb.Backend.Core.Exceptions;

public class ConflictApiException : RestApiException
{
    private const string _errorId = "default-conflict-error-id";

    public ConflictApiException(string message) : base(_errorId, message, HttpStatusCode.Conflict)
    { }

    public ConflictApiException(string message, object errorResponse) : base(_errorId, message, errorResponse, HttpStatusCode.Conflict)
    { }

    public ConflictApiException(string errorId, string message) : base(errorId, message, HttpStatusCode.Conflict)
    { }

    public ConflictApiException(string errorId, string? message, object errorResponse) : base(errorId, message, errorResponse, HttpStatusCode.Conflict)
    { }
}