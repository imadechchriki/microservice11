using Catalog.API.Data.Repositories.Interfaces;
using Catalog.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Catalog.API.Data.Repositories
{
    public class ModuleRepository : Repository<Module>, IModuleRepository
    {
        public ModuleRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Module>> GetModulesByFormationIdAsync(int formationId)
        {
            return await _context.Modules
                .Where(m => m.FormationId == formationId)
                .ToListAsync();
        }
    }
}