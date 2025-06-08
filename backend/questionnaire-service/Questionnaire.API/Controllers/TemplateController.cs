using Microsoft.AspNetCore.Mvc;
using Questionnaire.Application.Services;
using Questionnaire.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace Questionnaire.API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("api/template")]
    public class TemplateController : ControllerBase
    {
        private readonly TemplateService _templateService;

        public TemplateController(TemplateService templateService)
        {
            _templateService = templateService;
        }

        // POST /api/template/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateTemplate([FromBody] CreateTemplateRequest request)
        {
            var template = await _templateService.CreateTemplateAsync(request.TemplateCode, request.FiliereId, request.Role, request.Title);
            return Ok(template);
        }

        // GET /api/template/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTemplateById(int id)
        {
            var template = await _templateService.GetTemplateByIdAsync(id);
            if (template == null) return NotFound();
            return Ok(template);
        }

        // PUT /api/template/update/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateTemplate(int id, [FromBody] UpdateTemplateRequest request)
        {
            var updatedTemplate = await _templateService.UpdateTemplateAsync(id, request.TemplateCode, request.FiliereId, request.Role, request.Title);
            if (updatedTemplate == null) return NotFound();
            return Ok(updatedTemplate);
        }

        // DELETE /api/template/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            var result = await _templateService.DeleteTemplateAsync(id);
            if (result) return NoContent();
            return NotFound();
        }

        // GET /api/template/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAllTemplates()
        {
            var templates = await _templateService.GetAllTemplatesAsync();
            return Ok(templates);
        }
    }
}
