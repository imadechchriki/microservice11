using Questionnaire.Domain.Entities; // Pour FormationCacheDto
using Questionnaire.Domain.Entities.Events; 
namespace Questionnaire.Application.Services
{
    public interface IFormationCacheService
    {
        Task AddOrUpdateFormationAsync(FormationCreatedEvent formationEvent);
        Task<FormationCacheDto?> GetFormationAsync(string code);
        Task<IEnumerable<FormationCacheDto>> GetAllFormationsAsync();
      
    }
}