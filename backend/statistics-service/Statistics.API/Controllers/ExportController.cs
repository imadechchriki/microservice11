using Microsoft.AspNetCore.Mvc;
using Statistics.API.Models;
using Statistics.API.Services;

namespace Statistics.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExportController : ControllerBase
    {
        private readonly IExportService _exportService;
        private readonly IStatisticsService _statisticsService;
        private readonly ILogger<ExportController> _logger;

        public ExportController(
            IExportService exportService, 
            IStatisticsService statisticsService,
            ILogger<ExportController> logger)
        {
            _exportService = exportService;
            _statisticsService = statisticsService;
            _logger = logger;
        }

        /// <summary>
        /// Export overall statistics as PDF
        /// </summary>
        [HttpGet("overall/pdf")]
        public async Task<IActionResult> ExportOverallStatisticsPdf()
        {
            try
            {
                var stats = await _statisticsService.GetOverallStatisticsAsync();
                var pdfBytes = await _exportService.ExportOverallStatisticsToPdfAsync(stats);
                
                var fileName = $"statistiques_generales_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting overall statistics to PDF");
                return StatusCode(500, $"Error generating PDF: {ex.Message}");
            }
        }

        /// <summary>
        /// Export overall statistics as Excel
        /// </summary>
        [HttpGet("overall/excel")]
        public async Task<IActionResult> ExportOverallStatisticsExcel()
        {
            try
            {
                var stats = await _statisticsService.GetOverallStatisticsAsync();
                var excelBytes = await _exportService.ExportOverallStatisticsToExcelAsync(stats);
                
                var fileName = $"statistiques_generales_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting overall statistics to Excel");
                return StatusCode(500, $"Error generating Excel: {ex.Message}");
            }
        }

        /// <summary>
        /// Export overall statistics as CSV
        /// </summary>
        [HttpGet("overall/csv")]
        public async Task<IActionResult> ExportOverallStatisticsCsv()
        {
            try
            {
                var stats = await _statisticsService.GetOverallStatisticsAsync();
                var csvBytes = await _exportService.ExportOverallStatisticsToCsvAsync(stats);
                
                var fileName = $"statistiques_generales_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
                return File(csvBytes, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting overall statistics to CSV");
                return StatusCode(500, $"Error generating CSV: {ex.Message}");
            }
        }

        /// <summary>
        /// Export questionnaire statistics as PDF
        /// </summary>
        [HttpGet("questionnaire/{publicationId}/pdf")]
        public async Task<IActionResult> ExportQuestionnaireStatisticsPdf(int publicationId)
        {
            try
            {
                if (publicationId <= 0)
                {
                    return BadRequest("Publication ID must be greater than 0");
                }

                var stats = await _statisticsService.GetQuestionnaireStatisticsAsync(publicationId);
                var pdfBytes = await _exportService.ExportQuestionnaireStatisticsToPdfAsync(stats);
                
                var fileName = $"analyse_questionnaire_{publicationId}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting questionnaire {PublicationId} statistics to PDF", publicationId);
                return StatusCode(500, $"Error generating PDF: {ex.Message}");
            }
        }

        /// <summary>
        /// Export questionnaire statistics as Excel
        /// </summary>
        [HttpGet("questionnaire/{publicationId}/excel")]
        public async Task<IActionResult> ExportQuestionnaireStatisticsExcel(int publicationId)
        {
            try
            {
                if (publicationId <= 0)
                {
                    return BadRequest("Publication ID must be greater than 0");
                }

                var stats = await _statisticsService.GetQuestionnaireStatisticsAsync(publicationId);
                var excelBytes = await _exportService.ExportQuestionnaireStatisticsToExcelAsync(stats);
                
                var fileName = $"analyse_questionnaire_{publicationId}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting questionnaire {PublicationId} statistics to Excel", publicationId);
                return StatusCode(500, $"Error generating Excel: {ex.Message}");
            }
        }

        /// <summary>
        /// Export questionnaire statistics as CSV
        /// </summary>
        [HttpGet("questionnaire/{publicationId}/csv")]
        public async Task<IActionResult> ExportQuestionnaireStatisticsCsv(int publicationId)
        {
            try
            {
                if (publicationId <= 0)
                {
                    return BadRequest("Publication ID must be greater than 0");
                }

                var stats = await _statisticsService.GetQuestionnaireStatisticsAsync(publicationId);
                var csvBytes = await _exportService.ExportQuestionnaireStatisticsToCsvAsync(stats);
                
                var fileName = $"analyse_questionnaire_{publicationId}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
                return File(csvBytes, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting questionnaire {PublicationId} statistics to CSV", publicationId);
                return StatusCode(500, $"Error generating CSV: {ex.Message}");
            }
        }

        /// <summary>
        /// Export raw submissions data as Excel
        /// </summary>
        [HttpGet("submissions/{publicationId}/excel")]
        public async Task<IActionResult> ExportSubmissionsExcel(int publicationId)
        {
            try
            {
                if (publicationId <= 0)
                {
                    return BadRequest("Publication ID must be greater than 0");
                }

                var submissions = await _statisticsService.GetSubmissionsByPublicationAsync(publicationId);
                var stats = await _statisticsService.GetQuestionnaireStatisticsAsync(publicationId);
                var excelBytes = await _exportService.ExportSubmissionsToExcelAsync(submissions, stats.Title);
                
                var fileName = $"donnees_brutes_{publicationId}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting submissions {PublicationId} to Excel", publicationId);
                return StatusCode(500, $"Error generating Excel: {ex.Message}");
            }
        }

        /// <summary>
        /// Export raw submissions data as CSV
        /// </summary>
        [HttpGet("submissions/{publicationId}/csv")]
        public async Task<IActionResult> ExportSubmissionsCsv(int publicationId)
        {
            try
            {
                if (publicationId <= 0)
                {
                    return BadRequest("Publication ID must be greater than 0");
                }

                var submissions = await _statisticsService.GetSubmissionsByPublicationAsync(publicationId);
                var csvBytes = await _exportService.ExportSubmissionsToCsvAsync(submissions);
                
                var fileName = $"donnees_brutes_{publicationId}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
                return File(csvBytes, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting submissions {PublicationId} to CSV", publicationId);
                return StatusCode(500, $"Error generating CSV: {ex.Message}");
            }
        }

        /// <summary>
        /// Download the scoring system guide PDF
        /// </summary>
        [HttpGet("scoring-guide")]
        public IActionResult DownloadScoringGuide()
        {
            try
            {
                var fileName = "Guide-Systeme-Evaluation-Formations.pdf";
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "documents", fileName);
                
                if (!System.IO.File.Exists(filePath))
                {
                    _logger.LogWarning("Scoring guide PDF not found at path: {FilePath}", filePath);
                    return NotFound("Le guide du système de notation n'a pas été trouvé.");
                }

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                
                _logger.LogInformation("Scoring guide PDF downloaded successfully");
                
                return File(fileBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading scoring guide PDF");
                return StatusCode(500, $"Erreur lors du téléchargement du guide: {ex.Message}");
            }
        }

        /// <summary>
        /// Get available export formats for a given data type
        /// </summary>
        [HttpGet("formats")]
        public IActionResult GetAvailableFormats()
        {
            return Ok(new
            {
                OverallStatistics = new[] { "pdf", "excel", "csv" },
                QuestionnaireStatistics = new[] { "pdf", "excel", "csv" },
                RawSubmissions = new[] { "excel", "csv" }
            });
        }
    }
} 