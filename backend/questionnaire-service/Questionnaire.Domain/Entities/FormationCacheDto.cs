namespace Questionnaire.Domain.Entities
{
    public class FormationCacheDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int Credits { get; set; }
    }
}