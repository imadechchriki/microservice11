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
    public class ModuleController : ControllerBase
    {
        private readonly IModuleService _moduleService;

        public ModuleController(IModuleService moduleService)
        {
            _moduleService = moduleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ModuleDto>>> GetAll()
        {
            var modules = await _moduleService.GetAllModulesAsync();
            return Ok(modules);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ModuleDto>> GetById(int id)
        {
            var module = await _moduleService.GetModuleByIdAsync(id);
            if (module == null)
                return NotFound();

            return Ok(module);
        }

        [HttpGet("formation/{formationId}")]
        public async Task<ActionResult<IEnumerable<ModuleDto>>> GetByFormationId(int formationId)
        {
            var modules = await _moduleService.GetModulesByFormationIdAsync(formationId);
            return Ok(modules);
        }

        [HttpPost]
        public async Task<ActionResult<ModuleDto>> Create(CreateModuleDto moduleDto)
        {
            var module = await _moduleService.CreateModuleAsync(moduleDto);
            if (module == null)
                return BadRequest("Formation not found");

            return CreatedAtAction(nameof(GetById), new { id = module.Id }, module);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ModuleDto>> Update(int id, UpdateModuleDto moduleDto)
        {
            var module = await _moduleService.UpdateModuleAsync(id, moduleDto);
            if (module == null)
                return NotFound();

            return Ok(module);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _moduleService.DeleteModuleAsync(id);
            return NoContent();
        }
    }
}