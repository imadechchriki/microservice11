using Microsoft.AspNetCore.Mvc;
using Questionnaire.Application.Services;
using Questionnaire.Application.DTOs;
using Questionnaire.Domain.Entities.Events;

namespace Questionnaire.API.Controllers
{
    [ApiController]
    [Route("api/formation-cache")]
    public class FormationCacheController : ControllerBase
    {
        private readonly FormationCacheService _formationCacheService;

        public FormationCacheController(FormationCacheService formationCacheService)
        {
            _formationCacheService = formationCacheService;
        }

        [HttpPost]
        public async Task<IActionResult> AddFormationToCache([FromBody] FormationCreatedEvent formationDto)
        {
            try
            {
                await _formationCacheService.AddOrUpdateFormationAsync(formationDto);
                return Ok(new { message = "Formation added to cache successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        
    }
}