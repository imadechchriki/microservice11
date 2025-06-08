namespace Questionnaire.Application.DTOs
{
    public class CreateTemplateRequest
    {
        public string TemplateCode { get; set; }
        public int FiliereId { get; set; }  // Link to the department/formation
        public string Role { get; set; }  // Student, Professor, Professional
        public string Title { get; set; }
    }
}
