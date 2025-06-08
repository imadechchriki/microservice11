namespace Questionnaire.Application.DTOs;

/// <summary>Admin supplies start / end dates for a new publication.</summary>
public record PublishTemplateRequest(DateTimeOffset StartAt, DateTimeOffset EndAt);
