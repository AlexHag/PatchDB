using System.Net;

namespace PatchDb.Backend.Core.Exceptions;

public class NotFoundApiException : RestApiException
{
    private const string _errorId = "default-not-found-error-id";

    public NotFoundApiException(string message) : base(_errorId, message, HttpStatusCode.NotFound)
    { }

    public NotFoundApiException(string message, object errorResponse) : base(_errorId, message, errorResponse, HttpStatusCode.NotFound)
    { }

    public NotFoundApiException(string errorId, string message) : base(errorId, message, HttpStatusCode.NotFound)
    { }

    public NotFoundApiException(string errorId, string? message, object errorResponse) : base(errorId, message, errorResponse, HttpStatusCode.NotFound)
    { }
}