using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

using Questionnaire.Application.DTOs;
using Questionnaire.Domain.Entities;
using Questionnaire.Infrastructure.Persistence;
using Questionnaire.Infrastructure.Persistence.Queries;
using Questionnaire.Infrastructure;


namespace Questionnaire.Application.Services;

/// <summary>
/// Returns every completed submission for a given publication,
/// grouped by section, without relying on Question → Section navigation.
/// </summary>
public interface ISubmissionExportService
{
    Task<IReadOnlyList<SubmissionExportDto>> FetchAsync(int publicationId);
}

public sealed class SubmissionExportService : ISubmissionExportService
{
    private readonly QuestionnaireDbContext _db;

    public SubmissionExportService(QuestionnaireDbContext db) => _db = db;

    public async Task<IReadOnlyList<SubmissionExportDto>> FetchAsync(int publicationId)
    {
        // 1️⃣ Load submissions + answers + questions
        var submissions = await _db.Submissions
                                   .WithQuestionGraph() // includes Answers → Question
                                   .Where(s => s.PublicationId == publicationId &&
                                               s.Status == SubmissionStatus.Completed)
                                   .AsNoTracking()
                                   .ToListAsync();

        if (submissions.Count == 0)
            return Array.Empty<SubmissionExportDto>();

        // 2️⃣ Load Section metadata (single query)
        var sectionIds = submissions
            .SelectMany(s => s.Answers)
            .Select(a => a.Question.SectionId)
            .Distinct()
            .ToList();

        var sectionLookup = await _db.Sections
                                     .Where(sec => sectionIds.Contains(sec.Id))
                                     .ToDictionaryAsync(sec => sec.Id);

        // 3️⃣ Build DTOs
        var result = submissions.Select(sub => new SubmissionExportDto(
            sub.UserId,
            sub.SubmittedAt!.Value,
            sub.Answers
               .GroupBy(a => a.Question.SectionId)
               .Select(g =>
               {
                   var sec = sectionLookup[g.Key];
                   return new SectionBlockDto(
                       sec.Id,
                       sec.Title,
                       sec.DisplayOrder,
                       g.Select(ans => new AnswerDto2(
                           ans.Question.Id,
                           ans.Question.Wording,
                           ans.Question.Type,
                           ans.ValueNumber,
                           ans.ValueText))
                        .ToList());
               })
               .OrderBy(sb => sb.DisplayOrder)
               .ToList()))
            .ToList();

        return result;
    }
}
