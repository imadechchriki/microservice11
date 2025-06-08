using Catalog.API.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Catalog.API.Services.Interfaces
{
    public interface IFormationService
    {
        
        Task<IEnumerable<FormationDto>> GetAllFormationsAsync();
        Task<FormationDto> GetFormationByIdAsync(int id);
        Task<FormationDto> CreateFormationAsync(CreateFormationDto formationDto);
        Task<FormationDto> UpdateFormationAsync(int id, UpdateFormationDto formationDto);
        Task DeleteFormationAsync(int id);
    }
}