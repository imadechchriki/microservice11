using Microsoft.EntityFrameworkCore;
using Questionnaire.Application.DTOs;
using Questionnaire.Domain.Entities;
using Questionnaire.Infrastructure;

namespace Questionnaire.Application.Services
{
    public class ProfessionalService
    {
        private readonly QuestionnaireDbContext _context;

        public ProfessionalService(QuestionnaireDbContext context)
        {
            _context = context;
        }

        public async Task<List<QuestionnaireForProfessorDto>> GetPublishedQuestionnairesForProfessionalAsync()
        {
            var now = DateTimeOffset.UtcNow;

            var templates = await _context.Templates
                .Where(t => t.Status == TemplateStatus.Published && t.Role == "Professionnel")
                .Include(t => t.Sections)
                    .ThenInclude(s => s.Questions)
                .ToListAsync();

            return templates.Select(t => new QuestionnaireForProfessorDto
            {
                TemplateCode = t.TemplateCode ?? string.Empty,
                Title = t.Title ?? string.Empty,
                Version = t.Version,
                Sections = t.Sections.Select(s => new SectionDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Questions = s.Questions.Select(q => new QuestionDto
                    {
                        Id = q.Id,
                        Wording = q.Wording,
                        Type = q.Type.ToString(),
                        Mandatory = q.Mandatory,
                        MaxLength = q.MaxLength,
                        Options = q.Options.ToList()
                    }).ToList()
                }).ToList()
            }).ToList();
        }

        public async Task SubmitAnswersAsync(Guid userId, string templateCode, SubmitAnswersRequestDto request)
        {
            var now = DateTimeOffset.UtcNow;

            var publication = await _context.Publications
                .Where(p => p.TemplateCode == templateCode && p.StartAt <= now && p.EndAt >= now)
                .FirstOrDefaultAsync();

            if (publication == null)
                throw new KeyNotFoundException("No active publication found for this questionnaire.");

            var template = await _context.Templates
                .FirstOrDefaultAsync(t => t.TemplateCode == publication.TemplateCode && t.Role == "Professionnel");

            if (template == null)
                throw new InvalidOperationException("This publication is not for Professionals");

            var submission = await _context.Submissions
                .Include(s => s.Answers)
                .FirstOrDefaultAsync(s => s.PublicationId == publication.Id && s.UserId == userId);

            if (submission == null)
            {
                submission = new Submission(publication.Id, userId);
                _context.Submissions.Add(submission);
            }

            foreach (var ans in request.Answers)
            {
                submission.AddOrUpdate(ans.QuestionId, ans.ValueNumber, ans.ValueText);
            }

            submission.Complete();

            await _context.SaveChangesAsync();
        }
    }
}
