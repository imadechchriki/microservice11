using Questionnaire.Domain.Entities;
using Questionnaire.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Questionnaire.Application.Services
{
    public class TemplateService
    {
        private readonly QuestionnaireDbContext _context;

        public TemplateService(QuestionnaireDbContext context)
        {
            _context = context;
        }

        // Create a new QuestionnaireTemplate
        public async Task<QuestionnaireTemplate> CreateTemplateAsync(string templateCode, int filiereId, string role, string title)
        {
            var template = new QuestionnaireTemplate(templateCode, filiereId, role, title);
            _context.Templates.Add(template);
            await _context.SaveChangesAsync();
            return template;
        }

        // Get Template by ID
        public async Task<QuestionnaireTemplate?> GetTemplateByIdAsync(int id)
{
    return await _context.Templates
        .Include(t => t.Sections)
            .ThenInclude(s => s.Questions)
        .FirstOrDefaultAsync(t => t.Id == id);
}


        // Update Template
        public async Task<QuestionnaireTemplate?> UpdateTemplateAsync(int id, string? templateCode, int filiereId, string? role, string? title)
        {
            var template = await _context.Templates.FirstOrDefaultAsync(t => t.Id == id);
            if (template == null) return null;

            template.TemplateCode = templateCode;
            template.FiliereId = filiereId;
            template.Role = role;
            template.Title = title;
            
            _context.Templates.Update(template);
            await _context.SaveChangesAsync();

            return template;
        }

        // Delete Template
        public async Task<bool> DeleteTemplateAsync(int id)
        {
            var template = await _context.Templates.FirstOrDefaultAsync(t => t.Id == id);
            if (template == null) return false;

            _context.Templates.Remove(template);
            await _context.SaveChangesAsync();

            return true;
        }

        // Get All Templates
        public async Task<List<QuestionnaireTemplate>> GetAllTemplatesAsync()
{
    return await _context.Templates
        .Include(t => t.Sections)
            .ThenInclude(s => s.Questions)
        .ToListAsync();
}

    }
}
