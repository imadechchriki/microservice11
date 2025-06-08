namespace Statistics.API.Models
{
    public class SubmissionExportDto
    {
        public string UserId { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public List<SectionDto> Sections { get; set; } = new();
    }

    public class SectionDto
    {
        public int SectionId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public List<AnswerDto> Answers { get; set; } = new();
    }

    public class AnswerDto
    {
        public int QuestionId { get; set; }
        public string Wording { get; set; } = string.Empty;
        public int Type { get; set; }
        public decimal? ValueNumber { get; set; }
        public string? ValueText { get; set; }
    }
}