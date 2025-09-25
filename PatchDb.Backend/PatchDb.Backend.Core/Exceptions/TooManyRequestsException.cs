using System.Net;

namespace PatchDb.Backend.Core.Exceptions;

public class TooManyRequestsApiException : RestApiException
{
    private const string _errorId = "default-too-many-requests-error-id";

    public TooManyRequestsApiException(string message) : base(_errorId, message, HttpStatusCode.TooManyRequests)
    { }

    public TooManyRequestsApiException(string message, object errorResponse) : base(_errorId, message, errorResponse, HttpStatusCode.TooManyRequests)
    { }

    public TooManyRequestsApiException(string errorId, string message) : base(errorId, message, HttpStatusCode.TooManyRequests)
    { }

    public TooManyRequestsApiException(string errorId, string? message, object errorResponse) : base(errorId, message, errorResponse, HttpStatusCode.TooManyRequests)
    { }
}