using Catalog.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Catalog.API.Data.Repositories.Interfaces
{
    public interface IModuleRepository : IRepository<Module>
    {
        Task<IEnumerable<Module>> GetModulesByFormationIdAsync(int formationId);
    }
}