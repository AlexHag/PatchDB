using System.Net;

namespace PatchDb.Backend.Core.Exceptions;

public class RestApiException : Exception
{
    public string ErrorId { get; }
    public HttpStatusCode StatusCode { get; }
    public object? ErrorResponse { get; }

    public RestApiException(string errorId, string message, HttpStatusCode statusCode) : base(message)
    {
        ErrorId = errorId;
        StatusCode = statusCode;
    }

    public RestApiException(string errorId, string? message, object errorResponse, HttpStatusCode statusCode) : base(message)
    {
        ErrorId = errorId;
        StatusCode = statusCode;
        ErrorResponse = errorResponse;
    }
}