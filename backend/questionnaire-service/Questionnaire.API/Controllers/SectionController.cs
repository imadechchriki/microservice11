using Microsoft.AspNetCore.Mvc;
using Questionnaire.Application.Services;
using Questionnaire.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace Questionnaire.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/template/{templateId}/sections")] // Nested under the template ID
    public class SectionController : ControllerBase
    {
        private readonly SectionService _sectionService;

        public SectionController(SectionService sectionService)
        {
            _sectionService = sectionService;
        }

        // POST /api/template/{templateId}/sections
        [HttpPost]
        public async Task<IActionResult> CreateSection(int templateId, [FromBody] CreateSectionRequest request)
        {
            var section = await _sectionService.CreateSectionAsync(templateId, request.Title, request.DisplayOrder);
            return Ok(section);
        }

        // GET /api/template/{templateId}/sections
        [HttpGet]
        public async Task<IActionResult> GetSectionsByTemplateId(int templateId)
        {
            var sections = await _sectionService.GetSectionsByTemplateIdAsync(templateId);
            return Ok(sections);
        }

        // GET /api/template/{templateId}/sections/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSectionById(int templateId, int id)
        {
            var section = await _sectionService.GetSectionByIdAsync(templateId, id);
            if (section == null) return NotFound();
            return Ok(section);
        }

        // PUT /api/template/{templateId}/sections/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSection(int templateId, int id, [FromBody] UpdateSectionRequest request)
        {
            var updatedSection = await _sectionService.UpdateSectionAsync(templateId, id, request.Title, request.DisplayOrder);
            if (updatedSection == null) return NotFound();
            return Ok(updatedSection);
        }

        // DELETE /api/template/{templateId}/sections/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSection(int templateId, int id)
        {
            var result = await _sectionService.DeleteSectionAsync(templateId, id);
            if (result) return NoContent();
            return NotFound();
        }
    }
}
