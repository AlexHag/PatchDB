using System.Net;

namespace PatchDb.Backend.Core.Exceptions;

[Serializable]
public class BadRequestApiException : RestApiException
{
    private const string _errorId = "default-bad-request-error-id";

    public BadRequestApiException(string message) : base(_errorId, message, HttpStatusCode.BadRequest)
    { }

    public BadRequestApiException(string message, object errorResponse) : base(_errorId, message, errorResponse, HttpStatusCode.BadRequest)
    { }

    public BadRequestApiException(string errorId, string message) : base(errorId, message, HttpStatusCode.BadRequest)
    { }

    public BadRequestApiException(string errorId, string? message, object errorResponse) : base(errorId, message, errorResponse, HttpStatusCode.BadRequest)
    { }
}