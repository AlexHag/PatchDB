namespace PatchDb.Backend.Service.Universities;

public interface IUniversityService
{
    List<UniversityAndProgramModel> GetUniversitiesAndPrograms();
    List<UniversityModel> GetUniversities();
    UniversityModel? GetUniversity(string? code);
    bool IsValidUniversityInfo(string? code, string? program);
    bool IsValidUniversityCode(string code);
}

public class UniversityService : IUniversityService
{
    private readonly UniversityProgramListConfiguration _universityProgramListConfiguration;

    public UniversityService(UniversityProgramListConfiguration universityProgramListConfiguration)
    {
        _universityProgramListConfiguration = universityProgramListConfiguration;
    }

    public List<UniversityAndProgramModel> GetUniversitiesAndPrograms()
        => _universityProgramListConfiguration.Universities.Values.ToList();

    public List<UniversityModel> GetUniversities()
        => _universityProgramListConfiguration.Universities.Values.Select(u => new UniversityModel { Code = u.Code, Name = u.Name, LogoUrl = u.LogoUrl }).ToList();

    public UniversityModel? GetUniversity(string? code)
        => string.IsNullOrWhiteSpace(code)
            ? null
            : _universityProgramListConfiguration.Universities.GetValueOrDefault(code);

    public bool IsValidUniversityCode(string code)
        => _universityProgramListConfiguration.Universities.ContainsKey(code);

    public bool IsValidUniversityInfo(string? code, string? program)
    {
        // No university and no program
        if (string.IsNullOrWhiteSpace(code) && string.IsNullOrWhiteSpace(program))
        {
            return true;
        }

        // Only a university
        if (!string.IsNullOrWhiteSpace(code) && string.IsNullOrWhiteSpace(program))
        {
            return _universityProgramListConfiguration.Universities.ContainsKey(code);
        }

        // No university but a program
        // You can't have a program without a university
        if (string.IsNullOrWhiteSpace(code) && !string.IsNullOrWhiteSpace(program))
        {
            return false;
        }

        // Both a university and a program
        return _universityProgramListConfiguration.Universities.TryGetValue(code!, out var university) &&
               university.Programs.Any(p => p.Name.Equals(program, StringComparison.OrdinalIgnoreCase));
    }
}