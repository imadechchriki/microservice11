namespace Questionnaire.Application.DTOs
{
    public class CreateSectionRequest
    {
        public int TemplateId { get; set; }
        public string Title { get; set; }
        public int DisplayOrder { get; set; }
    }
}
