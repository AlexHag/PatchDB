using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace PatchDb.Backend.Core.Exceptions;

public class RestApiExceptionMiddleware
{
    private readonly IHostEnvironment _environment;
    private readonly ILogger _logger;
    private readonly RequestDelegate _next;

    public RestApiExceptionMiddleware(
        RequestDelegate next,
        IHostEnvironment environment,
        ILogger logger)
    {
        _next = next;
        _environment = environment;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            HttpStatusCode code;
            object? errorResponse = null;
            string errorId;

            if (ex is RestApiException restApiException)
            {
                code = restApiException.StatusCode;
                errorId = restApiException.ErrorId;
                errorResponse = restApiException.ErrorResponse;
            }
            else
            {
                code = HttpStatusCode.InternalServerError;
                errorId = "unhandled-internal-server-error-id";
            }

            _logger.Error(ex, "Exception: {Exception}, Context: {Context}, Code: {Code}, ErrorResponse: {ErrorResponse}, ErrorId: {ErrorId}",
                ex, context, code, errorResponse, errorId);

            var result = JsonSerializer.Serialize(new
            { 
                message = ex.Message,
                errorResponse,
                errorId,
                innerException = _environment.IsProduction() ? null : ex.ToString()
            });
            
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;
            await context.Response.WriteAsync(result);
        }
    }
}
