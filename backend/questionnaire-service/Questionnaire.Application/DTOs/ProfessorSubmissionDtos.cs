namespace Questionnaire.Application.DTOs
{
    public class QuestionnaireForProfessorDto
    {
        public string TemplateCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int Version { get; set; }
        public List<SectionDto> Sections { get; set; } = new();
    }

    public class SectionDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public List<QuestionDto> Questions { get; set; } = new();
    }

    public class QuestionDto
    {
        public int Id { get; set; }
        public string Wording { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool Mandatory { get; set; }
        public int? MaxLength { get; set; }
        public List<string> Options { get; set; } = new();
    }

    // DTO pour la soumission par le professeur
    public class SubmitAnswersRequestDto
    {
    
        public List<AnswerDto> Answers { get; set; } = new();
    }

    public class AnswerDto
    {
        public int QuestionId { get; set; }
        public decimal? ValueNumber { get; set; }
        public string? ValueText { get; set; }
    }
}
