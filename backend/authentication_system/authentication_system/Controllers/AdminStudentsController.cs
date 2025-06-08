
using authentication_system.Models;
using authentication_system.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace authentication_system.Controllers;

[ApiController]
[Route("api/admin/students")]
[Authorize(Roles = "Admin")]
public class AdminStudentsController : ControllerBase
{
    private readonly StudentAdminService _service;

    public AdminStudentsController(StudentAdminService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(StudentCreateDTO dto)
    {
        var (student, err) = await _service.CreateAsync(dto);
        if (student == null) return BadRequest(new { message = err });

        return CreatedAtAction(nameof(Get), new { id = student.Id }, new
        {
            student,
            message = "Un email a été envoyé à l'étudiant pour définir son mot de passe"
        });
    }

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.GetAllAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var student = await _service.GetAsync(id);
        return student == null ? NotFound() : Ok(student);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, StudentUpdateDTO dto)
    {
        var (ok, err) = await _service.UpdateAsync(id, dto);
        return ok ? NoContent() : BadRequest(new { message = err });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPost("import")]
    public async Task<IActionResult> Import(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Aucun fichier n'a été envoyé" });

        var (successCount, errorCount, errors) = await _service.ImportStudentsFromExcelAsync(file);

        return Ok(new
        {
            successCount,
            errorCount,
            errors,
            message = successCount > 0
                ? $"{successCount} étudiant(s) importé(s) avec succès. {errorCount} erreur(s)."
                : "Aucun étudiant n'a été importé."
        });
    }
}