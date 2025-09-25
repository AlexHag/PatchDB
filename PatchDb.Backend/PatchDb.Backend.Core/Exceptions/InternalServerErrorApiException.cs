using System.Net;

namespace PatchDb.Backend.Core.Exceptions;

public class InternalServerErrorApiException : RestApiException
{
    private const string _errorId = "default-internal-server-error-id";

    public InternalServerErrorApiException(string message) : base(_errorId, message, HttpStatusCode.InternalServerError)
    { }

    public InternalServerErrorApiException(string message, object errorResponse) : base(_errorId, message, errorResponse, HttpStatusCode.InternalServerError)
    { }

    public InternalServerErrorApiException(string errorId, string message) : base(errorId, message, HttpStatusCode.InternalServerError)
    { }

    public InternalServerErrorApiException(string errorId, string? message, object errorResponse) : base(errorId, message, errorResponse, HttpStatusCode.InternalServerError)
    { }
}