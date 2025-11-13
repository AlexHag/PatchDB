FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /app

# Copy solution and project files first
COPY PatchDb.Backend.sln ./
COPY global.json ./
COPY PatchDb.Backend.Service/ ./PatchDb.Backend.Service/
COPY PatchDb.Backend.Core/ ./PatchDb.Backend.Core/

# Restore as distinct layers
RUN dotnet restore
# Build and publish a release
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app
COPY --from=build /app/out .

ENTRYPOINT ["dotnet", "PatchDb.Backend.Service.dll"]