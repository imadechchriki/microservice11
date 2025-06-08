using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Questionnaire.Application.DTOs;
using Questionnaire.Application.Services;

namespace Questionnaire.API.Controllers;

[ApiController]
[Route("api/template/{templateId:int}/publish")]
[Authorize(Roles = "Admin")]
public class PublicationController : ControllerBase
{
    private readonly PublicationService _svc;
    public PublicationController(PublicationService svc) => _svc = svc;

    /// <summary>Publish a template -> new Publication row.</summary>
    [HttpPost]
    public async Task<IActionResult> Publish(int templateId,
                                             [FromBody] PublishTemplateRequest dto)
    {
        try
        {
            var pub = await _svc.PublishAsync(templateId, dto.StartAt, dto.EndAt);
            return Ok(pub);
        }
        catch (ArgumentException ex)        { return NotFound(ex.Message); }
    }
}
