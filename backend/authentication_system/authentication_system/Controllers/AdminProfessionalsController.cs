using authentication_system.Models;
using authentication_system.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace authentication_system.Controllers;

[ApiController]
[Route("api/admin/professionals")]
[Authorize(Roles = "Admin")]
public class AdminProfessionalsController : ControllerBase
{
    private readonly ProfessionalAdminService _service;
    private readonly ILogger<AdminProfessionalsController> _logger;

    public AdminProfessionalsController(ProfessionalAdminService service, ILogger<AdminProfessionalsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Crée un professionnel avec profil lié à un utilisateur.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProfessionalCreateDTO dto)
    {
        var (professional, err) = await _service.CreateAsync(dto);
        if (professional == null)
            return BadRequest(new { message = err });
        return Ok(new { professional });
    }

    /// <summary>
    /// Liste tous les professionnels.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    /// <summary>
    /// Récupère un professionnel par ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var professional = await _service.GetAsync(id);
        return professional == null ? NotFound() : Ok(professional);
    }

    /// <summary>
    /// Met à jour les informations d'un professionnel.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProfessionalUpdateDTO dto)
    {
        var (ok, err) = await _service.UpdateAsync(id, dto);
        return ok ? NoContent() : BadRequest(new { message = err });
    }

    /// <summary>
    /// Supprime un professionnel (et son User lié).
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    /// <summary>
    /// Importe des professionnels depuis un fichier Excel.
    /// </summary>
    [HttpPost("import-excel")]
    public async Task<IActionResult> ImportFromExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Aucun fichier n'a été fourni.");

        try
        {
            var (successCount, errorCount, errors) = await _service.ImportProfessionalsFromExcelAsync(file);
            return Ok(new
            {
                SuccessCount = successCount,
                ErrorCount = errorCount,
                Errors = errors
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Une erreur est survenue lors de l'importation du fichier Excel.");
            return StatusCode(500, "Une erreur est survenue lors du traitement du fichier. Veuillez réessayer.");
        }
    }
}
