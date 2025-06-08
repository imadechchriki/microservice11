using authentication_system.Models;
using authentication_system.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace authentication_system.Controllers;

[ApiController]
[Route("api/admin/teachers")]
[Authorize(Roles = "Admin")]
public class AdminTeachersController : ControllerBase
{
    private readonly TeacherAdminService _service;
    private readonly ILogger<AdminTeachersController> _logger;

    public AdminTeachersController(TeacherAdminService service, ILogger<AdminTeachersController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Crée un enseignant avec profil lié à un utilisateur.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TeacherCreateDTO dto)
    {
        var (teacher, err) = await _service.CreateAsync(dto);
        if (teacher == null)
            return BadRequest(new { message = err });
        return Ok(new { teacher });
    }

    /// <summary>
    /// Liste tous les enseignants.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    /// <summary>
    /// Récupère un enseignant par ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var teacher = await _service.GetAsync(id);
        return teacher == null ? NotFound() : Ok(teacher);
    }

    /// <summary>
    /// Met à jour les informations d'un enseignant.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] TeacherUpdateDTO dto)
    {
        var (ok, err) = await _service.UpdateAsync(id, dto);
        return ok ? NoContent() : BadRequest(new { message = err });
    }

    /// <summary>
    /// Supprime un enseignant (et son User lié).
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    /// <summary>
    /// Importe des enseignants depuis un fichier Excel.
    /// </summary>
    [HttpPost("import-excel")]
    public async Task<IActionResult> ImportFromExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Aucun fichier n'a été fourni.");

        try
        {
            var (successCount, errorCount, errors) = await _service.ImportTeachersFromExcelAsync(file);
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