namespace Questionnaire.Domain.Entities
{
    public sealed class QuestionnaireTemplate
    {
        private QuestionnaireTemplate() { }  // EF Core requires a parameterless constructor

        public QuestionnaireTemplate(string? templateCode, int filiereId, string? role, string? title)
        {
            TemplateCode = templateCode;
            Role = role;
            Title = title;
            FiliereId = filiereId;
        }

        public int Id { get; private set; }
        public string? TemplateCode { get; set; }
        public int FiliereId { get; set; }
        public string? Role { get; set; }
        public string? Title { get; set; }
        public TemplateStatus Status { get; private set; } = TemplateStatus.Draft;
        public int Version { get; private set; } = 1;
        public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

        // Navigation property to Sections
        public ICollection<Section> Sections { get; private set; } = new List<Section>();

        // Method to add a section
        public Section AddSection(string title, int order)
        {
            if (Status == TemplateStatus.Published)
                throw new InvalidOperationException("Template already published.");
            var section = new Section(this.Id, title, order); // Pass TemplateId directly
            Sections.Add(section);
            return section;
        }

        // Method to publish the template
        public void Publish() => Status = TemplateStatus.Published;
    }
}
