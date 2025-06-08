namespace Questionnaire.Domain.Entities;

public sealed class Publication
{
    // Parameterless constructor for EF Core to work
    private Publication() { }
    public int          Id           { get; private set; }
    public string          TemplateCode { get; set; }  // For example, the code for the questionnaire template
    public int             Version      { get; set; }  // Version of the template
    public int           FiliereId    { get; set; }  // Foreign key to FormationCache (the department/field)
    public DateTimeOffset  StartAt      { get; set; }  // Start date of the publication
    public DateTimeOffset  EndAt        { get; set; }  // End date of the publication

    private readonly List<Submission> _submissions = new();
    public IReadOnlyCollection<Submission> Submissions => _submissions.AsReadOnly();

    // Public constructor for creating the Publication instance
    public Publication(string templateCode, int version,int filiereId, DateTimeOffset startAt, DateTimeOffset endAt)
    {
        TemplateCode = templateCode;
        Version = version;
        FiliereId = filiereId;
        StartAt = startAt;
        EndAt = endAt;
    }
}
