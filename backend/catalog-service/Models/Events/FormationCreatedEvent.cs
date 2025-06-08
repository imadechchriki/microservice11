namespace CatalogService.Models.Events
{
    public class FormationCreatedEvent
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int Credits { get; set; }
        public DateTime CreatedAt { get; set; }
        public string EventType { get; set; } = "FormationCreated";
    }
}