using Microsoft.AspNetCore.Mvc;
using Statistics.API.Models;
using Statistics.API.Services;

namespace Statistics.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsService _statisticsService;

        public StatisticsController(IStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("health")]
        public ActionResult Health()
        {
            return Ok(new { 
                status = "healthy", 
                service = "statistics-api", 
                timestamp = DateTime.UtcNow,
                questionnaireServiceUrl = Environment.GetEnvironmentVariable("QUESTIONNAIRE_SERVICE_URL") ?? "http://localhost:5138"
            });
        }

        /// <summary>
        /// Get all available publications from questionnaire service
        /// </summary>
        [HttpGet("publications")]
        public async Task<ActionResult<List<PublicationInfoDto>>> GetAllPublications()
        {
            try
            {
                var publications = await _statisticsService.GetAllPublicationsAsync();
                return Ok(publications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting publications: {ex.Message}");
            }
        }

        /// <summary>
        /// Get detailed statistics for a specific questionnaire publication
        /// </summary>
        [HttpGet("questionnaire/{publicationId}")]
        public async Task<ActionResult<QuestionnaireStatisticsDto>> GetQuestionnaireStatistics(int publicationId)
        {
            if (publicationId <= 0)
            {
                return BadRequest("Publication ID must be greater than 0");
            }

            var stats = await _statisticsService.GetQuestionnaireStatisticsAsync(publicationId);
            return Ok(stats);
        }

        /// <summary>
        /// Get raw submission data for a publication (proxy to questionnaire service)
        /// </summary>
        [HttpGet("submissions/{publicationId}")]
        public async Task<ActionResult<List<SubmissionExportDto>>> GetSubmissions(int publicationId)
        {
            if (publicationId <= 0)
            {
                return BadRequest("Publication ID must be greater than 0");
            }

            var submissions = await _statisticsService.GetSubmissionsByPublicationAsync(publicationId);
            return Ok(submissions);
        }

        /// <summary>
        /// Get overall statistics across all questionnaires
        /// </summary>
        [HttpGet("overall")]
        public async Task<ActionResult<OverallStatisticsDto>> GetOverallStatistics()
        {
            var stats = await _statisticsService.GetOverallStatisticsAsync();
            return Ok(stats);
        }

        /// <summary>
        /// Get statistics summary for multiple publications
        /// </summary>
        [HttpPost("publications/summary")]
        public async Task<ActionResult<List<QuestionnaireStatisticsSummaryDto>>> GetPublicationsSummary(
            [FromBody] List<int> publicationIds)
        {
            try
            {
                if (publicationIds == null || !publicationIds.Any())
                {
                    return BadRequest("Publication IDs list cannot be empty");
                }

                var summaries = await _statisticsService.GetPublicationsSummaryAsync(publicationIds);
                return Ok(summaries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting publications summary: {ex.Message}");
            }
        }
    }
}