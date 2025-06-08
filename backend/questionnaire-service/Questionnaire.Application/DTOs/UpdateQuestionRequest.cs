using Questionnaire.Domain.Entities;

namespace Questionnaire.Application.DTOs
{
    public class UpdateQuestionRequest
    {
        public string Wording { get; set; }
        public QuestionType Type { get; set; }
        public int? MaxLength { get; set; }
      
    }
}
