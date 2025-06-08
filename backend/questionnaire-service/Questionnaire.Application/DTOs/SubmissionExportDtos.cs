using System;
using System.Collections.Generic;
using Questionnaire.Domain.Entities;   // QuestionType enum

namespace Questionnaire.Application.DTOs;

/// Root element
public sealed record SubmissionExportDto(
    Guid UserId,
    DateTimeOffset SubmittedAt,
    IReadOnlyList<SectionBlockDto> Sections);

/// Grouped answers per Section
public sealed record SectionBlockDto(
    int SectionId,
    string Title,
    int DisplayOrder,
    IReadOnlyList<AnswerDto2> Answers);

/// Single answer row
public sealed record AnswerDto2(
    int QuestionId,
    string Wording,
    QuestionType Type,
    decimal? ValueNumber,
    string? ValueText);
