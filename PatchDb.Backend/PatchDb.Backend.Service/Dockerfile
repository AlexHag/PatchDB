# Use the official .NET SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["PatchDb.Backend.sln", "./"]
COPY ["PatchDb.Backend.Service/PatchDb.Backend.Service.csproj", "PatchDb.Backend.Service/"]
COPY ["PatchDb.Backend.Core/PatchDb.Backend.Core.csproj", "PatchDb.Backend.Core/"]

# Restore dependencies
RUN dotnet restore "PatchDb.Backend.Service/PatchDb.Backend.Service.csproj"

# Copy the rest of the source code
COPY . .

# Build and publish the application
WORKDIR "/src/PatchDb.Backend.Service"
RUN dotnet publish "PatchDb.Backend.Service.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official ASP.NET Core runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "PatchDb.Backend.Service.dll"]