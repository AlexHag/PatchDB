namespace PatchDb.Backend.Service.Universities;

public interface IUniversityService
{
    List<UniversityAndProgramModel> GetAll();
    UniversityModel? GetUniversity(string? code);
    bool IsValidUniversityInfo(string? code, string? program);
}

public class UniversityService : IUniversityService
{
    private readonly UniversityProgramListConfiguration _universityProgramListConfiguration;

    public UniversityService(UniversityProgramListConfiguration universityProgramListConfiguration)
    {
        _universityProgramListConfiguration = universityProgramListConfiguration;
    }

    public List<UniversityAndProgramModel> GetAll()
        => _universityProgramListConfiguration.Universities.Values.ToList();

    public UniversityModel? GetUniversity(string? code)
        => string.IsNullOrWhiteSpace(code)
            ? null
            : _universityProgramListConfiguration.Universities.GetValueOrDefault(code);

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