namespace Questionnaire.Application.DTOs
{
    public class QuestionnaireForStudentDto
    {
        public string TemplateCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int Version { get; set; }
        public string FiliereCode { get; set; } = string.Empty;
        public List<SectionDto> Sections { get; set; } = new();
    }
}