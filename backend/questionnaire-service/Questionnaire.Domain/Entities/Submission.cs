namespace Questionnaire.Domain.Entities;

public sealed class Submission
{
    private Submission() { }

    public Submission(int publicationId, Guid userId)
    {
        PublicationId = publicationId;
        UserId        = userId;
        Status        = SubmissionStatus.Pending;
    }

    public int           Id            { get; private set; }
    public int           PublicationId { get; private set; }
    public Publication      Publication   { get; private set; } = null!;
    public Guid           UserId        { get; private set; }
   //  public User User { get; set; }  // Navigation property to the User

    public SubmissionStatus Status        { get; private set; }
    public DateTimeOffset?  SubmittedAt   { get; private set; }

    private readonly List<SubmissionAnswer> _answers = new();
    public IReadOnlyCollection<SubmissionAnswer> Answers => _answers.AsReadOnly();

    public SubmissionAnswer AddOrUpdate(int questionId, decimal? num, string? text)
    {
        var a = _answers.Find(x => x.QuestionId == questionId);
        if (a is null)
        {
            a = new SubmissionAnswer(Id, questionId, num, text);
            _answers.Add(a);
        }
        else
        {
            a.UpdateValue(num, text);
        }
        return a;
    }

    public void Complete()
    {
        Status      = SubmissionStatus.Completed;
        SubmittedAt = DateTimeOffset.UtcNow;
    }
}
