namespace Statistics.API.Models
{
    public class QuestionnaireStatisticsDto
    {
        public int PublicationId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int TotalSubmissions { get; set; }
        public double CompletionRate { get; set; }
        public List<SectionStatisticsDto> SectionStatistics { get; set; } = new();
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class QuestionnaireStatisticsSummaryDto
    {
        public int PublicationId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int TotalSubmissions { get; set; }
        public double CompletionRate { get; set; }
        public double AverageRating { get; set; }
    }

    public class SectionStatisticsDto
    {
        public int SectionId { get; set; }
        public string SectionTitle { get; set; } = string.Empty;
        public List<QuestionStatisticsDto> QuestionStatistics { get; set; } = new();
    }

    public class QuestionStatisticsDto
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public int TotalAnswers { get; set; }
        public double? AverageScore { get; set; }
        public List<AnswerDistributionDto> AnswerDistribution { get; set; } = new();
        public List<string> TextAnswers { get; set; } = new();
    }

    public class AnswerDistributionDto
    {
        public string AnswerValue { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class OverallStatisticsDto
    {
        public int TotalQuestionnaires { get; set; }
        public int TotalSubmissions { get; set; }
        public double OverallCompletionRate { get; set; }
        public List<FormationStatisticsDto> FormationStatistics { get; set; } = new();
    }

    public class FormationStatisticsDto
    {
        public string FormationCode { get; set; } = string.Empty;
        public string FormationTitle { get; set; } = string.Empty;
        public int SubmissionCount { get; set; }
        public double AverageRating { get; set; }
    }

    public class PublicationSummaryDto
    {
        public int Id { get; set; }
        public string TemplateCode { get; set; } = string.Empty;
        public int FiliereId { get; set; }
    }

    public class FormationInfoDto
    {
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
    }

    // DTOs for fetching real data from questionnaire service
    public class PublicationInfoDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? TemplateCode { get; set; }
        public int? FiliereId { get; set; }
        public string? FormationCode { get; set; }
        public string? FormationTitle { get; set; }
        public DateTime? StartAt { get; set; }
        public DateTime? EndAt { get; set; }
    }
}