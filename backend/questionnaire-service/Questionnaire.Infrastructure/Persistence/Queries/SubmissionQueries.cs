using Microsoft.EntityFrameworkCore;
using Questionnaire.Domain.Entities;

namespace Questionnaire.Infrastructure.Persistence.Queries;

public static class SubmissionQueries
{
    // No .ThenInclude(q => q.Section) because Question doesn’t have that nav
    public static IQueryable<Submission> WithQuestionGraph(this IQueryable<Submission> q) =>
        q.Include(s => s.Answers)
         .ThenInclude(a => a.Question)
         .Include(s => s.Publication);
}
