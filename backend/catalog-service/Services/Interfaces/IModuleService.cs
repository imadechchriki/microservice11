using Catalog.API.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Catalog.API.Services.Interfaces
{
    public interface IModuleService
    {
        Task<IEnumerable<ModuleDto>> GetAllModulesAsync();
        Task<ModuleDto> GetModuleByIdAsync(int id);
        Task<IEnumerable<ModuleDto>> GetModulesByFormationIdAsync(int formationId);
        Task<ModuleDto> CreateModuleAsync(CreateModuleDto moduleDto);
        Task<ModuleDto> UpdateModuleAsync(int id, UpdateModuleDto moduleDto);
        Task DeleteModuleAsync(int id);
    }
}