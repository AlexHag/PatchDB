using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using Microsoft.IdentityModel.Tokens;
using PatchDb.Backend.Core.Authentication.Configuration;
using PatchDb.Backend.Core.Authentication.Models;

namespace PatchDb.Backend.Core.Authentication;

public interface ITokenService
{
    AccessTokenModel GenerateToken(Guid userId, AuthenticationMethod method, params Claim[] additionalClaims);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
    AccessTokenModel ValidateToken(string token, out Guid userId);
}

internal class TokenService : ITokenService
{
    private readonly JwtConfiguration _config;
    private readonly SigningCredentials _credentials;

    public TokenService(
        JwtConfiguration config,
        X509Certificate2 cert)
    {
        _config = config;
        _credentials = new SigningCredentials(new X509SecurityKey(cert), SecurityAlgorithms.RsaSha256);
    }

    public AccessTokenModel ValidateToken(string token, out Guid userId)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _config.Issuer,
            ValidateAudience = true,
            ValidAudience = _config.Audience,
            ValidateLifetime = true,
            IssuerSigningKey = _credentials.Key,
            ValidateIssuerSigningKey = true
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

        var jwt = (JwtSecurityToken)securityToken;

        userId = Guid.Parse(jwt.Claims.First(x => x.Type == "userId").Value);

        var response = new AccessTokenModel
        {
            SessionId = Guid.Parse(jwt.Claims.First(x => x.Type == JwtRegisteredClaimNames.Jti).Value),
            AccessToken = token,
            RefreshToken = Guid.NewGuid().ToString(),
            Method = Enum.Parse<AuthenticationMethod>(jwt.Claims.First(x => x.Type == "method").Value),
            ExpirationTime = jwt.ValidTo,
            IssuedAt = jwt.ValidFrom
        };

        return response;
    }

    public AccessTokenModel GenerateToken(Guid userId, AuthenticationMethod method, params Claim[] additionalClaims)
    {
        var sessionId = Guid.NewGuid();

        var claims = new List<Claim>
        {
            new("userId", userId.ToString()),
            new("method", method.ToString())
        };

        claims.AddRange(additionalClaims);

        if (!claims.Any(p => p.Type == JwtRegisteredClaimNames.Jti))
        {
            claims.Add(new(JwtRegisteredClaimNames.Jti, sessionId.ToString()));
        }
        else
        {
            sessionId = Guid.Parse(claims.First(p => p.Type == JwtRegisteredClaimNames.Jti).Value);
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            IssuedAt = DateTime.UtcNow,
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = _credentials,
            Issuer = _config.Issuer,
            Audience = _config.Audience,
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var accessToken = tokenHandler.WriteToken(token);

        var response = new AccessTokenModel
        {
            SessionId = sessionId,
            AccessToken = accessToken,
            RefreshToken = Guid.NewGuid().ToString(),
            Method = method,
            ExpirationTime = tokenDescriptor.Expires.Value,
            IssuedAt = tokenDescriptor.IssuedAt.Value
        };

        return response;
    }

    public string HashPassword(string password)
    {
        var salt = BCrypt.Net.BCrypt.GenerateSalt();
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password, salt);

        return passwordHash;
    }

    public bool VerifyPassword(string password, string hash)
        => BCrypt.Net.BCrypt.Verify(password, hash);
}