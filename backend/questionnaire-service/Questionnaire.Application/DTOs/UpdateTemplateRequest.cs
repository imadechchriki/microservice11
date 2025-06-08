namespace Questionnaire.Application.DTOs
{
    public class UpdateTemplateRequest
    {
        public string? TemplateCode { get; set; }
        public int FiliereId { get; set; }
        public string? Role { get; set; }
        public string? Title { get; set; }
    }
}
