using Statistics.API.Models;

namespace Statistics.API.Services
{
    public interface IStatisticsService
    {
        Task<List<SubmissionExportDto>> GetSubmissionsByPublicationAsync(int publicationId);
        Task<QuestionnaireStatisticsDto> GetQuestionnaireStatisticsAsync(int publicationId);
        Task<OverallStatisticsDto> GetOverallStatisticsAsync();
        Task<List<QuestionnaireStatisticsSummaryDto>> GetPublicationsSummaryAsync(List<int> publicationIds);
        Task<List<PublicationInfoDto>> GetAllPublicationsAsync();
    }
}