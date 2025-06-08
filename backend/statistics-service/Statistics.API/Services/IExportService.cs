using Statistics.API.Models;

namespace Statistics.API.Services
{
    public interface IExportService
    {
        /// <summary>
        /// Export overall statistics to PDF
        /// </summary>
        Task<byte[]> ExportOverallStatisticsToPdfAsync(OverallStatisticsDto stats);

        /// <summary>
        /// Export overall statistics to Excel
        /// </summary>
        Task<byte[]> ExportOverallStatisticsToExcelAsync(OverallStatisticsDto stats);

        /// <summary>
        /// Export overall statistics to CSV
        /// </summary>
        Task<byte[]> ExportOverallStatisticsToCsvAsync(OverallStatisticsDto stats);

        /// <summary>
        /// Export questionnaire statistics to PDF
        /// </summary>
        Task<byte[]> ExportQuestionnaireStatisticsToPdfAsync(QuestionnaireStatisticsDto stats);

        /// <summary>
        /// Export questionnaire statistics to Excel
        /// </summary>
        Task<byte[]> ExportQuestionnaireStatisticsToExcelAsync(QuestionnaireStatisticsDto stats);

        /// <summary>
        /// Export questionnaire statistics to CSV
        /// </summary>
        Task<byte[]> ExportQuestionnaireStatisticsToCsvAsync(QuestionnaireStatisticsDto stats);

        /// <summary>
        /// Export raw submissions to Excel
        /// </summary>
        Task<byte[]> ExportSubmissionsToExcelAsync(List<SubmissionExportDto> submissions, string title);

        /// <summary>
        /// Export raw submissions to CSV
        /// </summary>
        Task<byte[]> ExportSubmissionsToCsvAsync(List<SubmissionExportDto> submissions);
    }
} 