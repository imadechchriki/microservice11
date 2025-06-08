using Microsoft.EntityFrameworkCore;
using Questionnaire.Domain.Entities;
using Questionnaire.Infrastructure;

namespace Questionnaire.Application.Services;

public class PublicationService
{
    private readonly QuestionnaireDbContext _db;
    public PublicationService(QuestionnaireDbContext db) => _db = db;

   public async Task<Publication> PublishAsync(int templateId, DateTimeOffset start, DateTimeOffset end, CancellationToken ct = default)
{
    if (end <= start)
        throw new ArgumentException("End date must be after start date.");

    var template = await _db.Templates.FindAsync(new object[] { templateId }, ct)
                  ?? throw new ArgumentException("Template not found.");

    // Fetch versions as list to allow client-side LINQ operations
    var versions = await _db.Publications
                            .Where(p => p.TemplateCode == template.TemplateCode)
                            .Select(p => p.Version)
                            .ToListAsync(ct);

    int maxVersion = versions.DefaultIfEmpty(0).Max();
    int nextVersion = maxVersion + 1;

    var publication = new Publication(
        template.TemplateCode ?? $"T{template.Id}",
        nextVersion,
        template.FiliereId,
        start,
        end
    );

    _db.Publications.Add(publication);

    if (template.Status == TemplateStatus.Draft)
        template.Publish();

    await _db.SaveChangesAsync(ct);
    return publication;
}

}
