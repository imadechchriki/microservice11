using Questionnaire.Domain.Entities;
using Questionnaire.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Questionnaire.Application.Services
{
    public class SectionService
    {
        private readonly QuestionnaireDbContext _context;

        public SectionService(QuestionnaireDbContext context)
        {
            _context = context;
        }

        // Create a new Section for a specific Template
        public async Task<Section> CreateSectionAsync(int templateId, string title, int displayOrder)
        {
            var section = new Section(templateId, title, displayOrder);
            _context.Sections.Add(section);
            await _context.SaveChangesAsync();
            return section;
        }

        // Get all Sections for a specific Template
        public async Task<List<Section>> GetSectionsByTemplateIdAsync(int templateId)
        {
            return await _context.Sections
                .Where(s => s.TemplateId == templateId)
                .ToListAsync();
        }

        // Get a Section by ID for a specific Template
        public async Task<Section?> GetSectionByIdAsync(int templateId, int id)
        {
            return await _context.Sections
                .FirstOrDefaultAsync(s => s.Id == id && s.TemplateId == templateId);
        }

        // Update Section for a specific Template
        public async Task<Section?> UpdateSectionAsync(int templateId, int id, string title, int displayOrder)
        {
            var section = await _context.Sections
                .FirstOrDefaultAsync(s => s.Id == id && s.TemplateId == templateId);
            if (section == null) return null;

            section.Title = title;
            section.DisplayOrder = displayOrder;

            _context.Sections.Update(section);
            await _context.SaveChangesAsync();

            return section;
        }

        // Delete Section for a specific Template
        public async Task<bool> DeleteSectionAsync(int templateId, int id)
        {
            var section = await _context.Sections
                .FirstOrDefaultAsync(s => s.Id == id && s.TemplateId == templateId);
            if (section == null) return false;

            _context.Sections.Remove(section);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
