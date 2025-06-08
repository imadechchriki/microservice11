namespace Questionnaire.Domain.Entities;

public enum TemplateStatus : short { Draft = 0, Published = 1 }
public enum QuestionType : short { Likert = 1, Binary = 2, Text = 3 }
public enum SubmissionStatus : short { Pending = 0, Completed = 1 }
