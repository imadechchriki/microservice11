using Microsoft.EntityFrameworkCore;
using Questionnaire.Domain.Entities;
using Questionnaire.Infrastructure;

namespace Questionnaire.Application.Services
{
    public class QuestionService
    {
        private readonly QuestionnaireDbContext _context;

        public QuestionService(QuestionnaireDbContext context)
        {
            _context = context;
        }

        // Create a new Question in a specific Section under a Template
        public async Task<Question> CreateQuestionAsync(int templateId, int sectionId, string wording, QuestionType type, int? maxLength = null)
        {
            var section = await _context.Sections
                                         .Where(s => s.TemplateId == templateId)
                                         .FirstOrDefaultAsync(s => s.Id == sectionId);

            if (section == null)
                throw new ArgumentException("Section not found under this template.");

            var question = new Question(sectionId, wording, type, maxLength);

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            return question;
        }

        // Get all Questions under a specific Section of a Template
        public async Task<List<Question>> GetQuestionsBySectionIdAsync(int templateId, int sectionId)
        {
            var section = await _context.Sections
                                         .Where(s => s.TemplateId == templateId)
                                         .FirstOrDefaultAsync(s => s.Id == sectionId);

            if (section == null)
                throw new ArgumentException("Section not found under this template.");

            return await _context.Questions
                                 .Where(q => q.SectionId == sectionId)
                                 .ToListAsync();
        }

        // Get a specific Question by its ID under a specific Section of a Template
        public async Task<Question> GetQuestionByIdAsync(int templateId, int sectionId, int questionId)
        {
            var section = await _context.Sections
                                         .Where(s => s.TemplateId == templateId)
                                         .FirstOrDefaultAsync(s => s.Id == sectionId);

            if (section == null)
                throw new ArgumentException("Section not found under this template.");

            var question = await _context.Questions
                                         .FirstOrDefaultAsync(q => q.SectionId == sectionId && q.Id == questionId);

            if (question == null)
                throw new ArgumentException("Question not found under this section.");

            return question;
        }

        // Update a Question under a specific Section of a Template
        public async Task<Question> UpdateQuestionAsync(int templateId, int sectionId, int questionId, string wording, QuestionType type, int? maxLength = null)
        {
            var section = await _context.Sections
                                         .Where(s => s.TemplateId == templateId)
                                         .FirstOrDefaultAsync(s => s.Id == sectionId);

            if (section == null)
                throw new ArgumentException("Section not found under this template.");

            var question = await _context.Questions
                                         .FirstOrDefaultAsync(q => q.SectionId == sectionId && q.Id == questionId);

            if (question == null)
                throw new ArgumentException("Question not found.");

            question.Wording = wording;
            question.Type = type;
            question.MaxLength = maxLength;

            await _context.SaveChangesAsync();
            return question;
        }

        // Delete a Question under a specific Section of a Template
        public async Task DeleteQuestionAsync(int templateId, int sectionId, int questionId)
        {
            var section = await _context.Sections
                                         .Where(s => s.TemplateId == templateId)
                                         .FirstOrDefaultAsync(s => s.Id == sectionId);

            if (section == null)
                throw new ArgumentException("Section not found under this template.");

            var question = await _context.Questions
                                         .FirstOrDefaultAsync(q => q.SectionId == sectionId && q.Id == questionId);

            if (question == null)
                throw new ArgumentException("Question not found.");

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
        }
    }
}
