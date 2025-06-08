using Questionnaire.Domain.Entities;

namespace Questionnaire.Application.DTOs
{
    public class CreateQuestionRequest
    {
        public string Wording { get; set; }  // Question wording
        public QuestionType Type { get; set; }  // Question type (e.g., Likert, Binary, Text)
        public int? MaxLength { get; set; }  // Maximum length for the answer, if applicable
      
    }
}
