using Catalog.API.DTOs;
using Catalog.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace Catalog.API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    public class FormationController : ControllerBase
    {
        private readonly IFormationService _formationService;

        public FormationController(IFormationService formationService)
        {
            _formationService = formationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FormationDto>>> GetAll()
        {
            var formations = await _formationService.GetAllFormationsAsync();
            return Ok(formations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FormationDto>> GetById(int id)
        {
            var formation = await _formationService.GetFormationByIdAsync(id);
            if (formation == null)
                return NotFound();

            return Ok(formation);
        }

        [HttpPost]
        public async Task<ActionResult<FormationDto>> Create(CreateFormationDto formationDto)
        {
            var formation = await _formationService.CreateFormationAsync(formationDto);
            return CreatedAtAction(nameof(GetById), new { id = formation.Id }, formation);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<FormationDto>> Update(int id, UpdateFormationDto formationDto)
        {
            var formation = await _formationService.UpdateFormationAsync(id, formationDto);
            if (formation == null)
                return NotFound();

            return Ok(formation);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _formationService.DeleteFormationAsync(id);
            return NoContent();
        }
    }
}