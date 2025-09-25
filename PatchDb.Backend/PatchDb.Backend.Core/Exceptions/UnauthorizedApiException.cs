using System.Net;

namespace PatchDb.Backend.Core.Exceptions;

public class UnauthorizedApiException : RestApiException
{
    private const string _errorId = "default-unauthorized-error-id";

    public UnauthorizedApiException(string message) : base(_errorId, message, HttpStatusCode.Unauthorized)
    { }

    public UnauthorizedApiException(string message, object errorResponse) : base(_errorId, message, errorResponse, HttpStatusCode.Unauthorized)
    { }

    public UnauthorizedApiException(string errorId, string message) : base(errorId, message, HttpStatusCode.Unauthorized)
    { }

    public UnauthorizedApiException(string errorId, string? message, object errorResponse) : base(errorId, message, errorResponse, HttpStatusCode.Unauthorized)
    { }
}