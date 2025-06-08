using Catalog.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Catalog.API.Data.Repositories.Interfaces
{
    public interface IFormationRepository : IRepository<Formation>
    {
        Task<Formation> GetFormationWithModulesAsync(int id);
        Task<IEnumerable<Formation>> GetAllFormationsWithModulesAsync();
    }
}