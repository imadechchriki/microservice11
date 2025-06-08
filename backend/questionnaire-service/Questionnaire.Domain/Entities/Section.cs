namespace Questionnaire.Domain.Entities
{
    public sealed class Section
    {
        private Section() { }  // EF Core requires a parameterless constructor

        public Section(int templateId, string title, int displayOrder)
        {
            TemplateId = templateId;
            Title = title;
            DisplayOrder = displayOrder;
        }

        public int Id { get; set; }
        public int TemplateId { get; set; }  // Foreign Key for the Template
        public string Title { get; set; }
        public int DisplayOrder { get; set; }

        // Navigation property for Questions
        public ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}
