using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Questionnaire.Application.DTOs;
using Questionnaire.Application.Services;
using Questionnaire.Infrastructure;

namespace Questionnaire.API.Controllers;

[ApiController]
[Route("api/publications")]
//[Authorize(Policy = "ReportAccess")]   // only Report service or Admin
public sealed class SubmissionExportController : ControllerBase
{
    private readonly ISubmissionExportService _svc;
    private readonly QuestionnaireDbContext _context;
    
    public SubmissionExportController(ISubmissionExportService svc, QuestionnaireDbContext context) 
    {
        _svc = svc;
        _context = context;
    }

    // GET /api/publications
    [HttpGet]
    public async Task<IActionResult> GetAllPublications()
    {
        var publications = await _context.Publications
            .Select(p => new { 
                p.Id, 
                p.TemplateCode, 
                p.FiliereId,
                Title = _context.Templates.Where(t => t.TemplateCode == p.TemplateCode).Select(t => t.Title).FirstOrDefault(),
                FormationCode = _context.Formations.Where(f => f.Id == p.FiliereId).Select(f => f.Code).FirstOrDefault(),
                FormationTitle = _context.Formations.Where(f => f.Id == p.FiliereId).Select(f => f.Title).FirstOrDefault(),
                p.StartAt,
                p.EndAt
            })
            .ToListAsync();
        return Ok(publications);
    }

    // GET /api/publications/{id}/submissions
    [HttpGet("{id:int}/submissions")]
    [ProducesResponseType(typeof(IReadOnlyList<SubmissionExportDto>), 200)]
    public async Task<IActionResult> GetAll(int id)
    {
        var list = await _svc.FetchAsync(id);
        return Ok(list);   // empty list ⇒ 200 with []  (report service can handle no-data)
    }
}
