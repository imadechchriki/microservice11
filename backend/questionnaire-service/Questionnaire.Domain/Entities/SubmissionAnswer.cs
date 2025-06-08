namespace Questionnaire.Domain.Entities;

public sealed class SubmissionAnswer
{
    private SubmissionAnswer() { }

    internal SubmissionAnswer(int submissionId, int questionId, decimal? num, string? text)
    {
        SubmissionId = submissionId;
        QuestionId   = questionId;
        ValueNumber  = num;
        ValueText    = text;
    }

    public int      Id           { get; private set; }
    public int      SubmissionId { get; private set; }
    public Submission Submission  { get; private set; } = null!;
    public int      QuestionId   { get; private set; }
    public Question  Question     { get; private set; } = null!;
    public decimal?  ValueNumber  { get; private set; }
    public string?   ValueText    { get; private set; }

    internal void UpdateValue(decimal? num, string? text)
    {
        ValueNumber = num;
        ValueText   = text;
    }
}
