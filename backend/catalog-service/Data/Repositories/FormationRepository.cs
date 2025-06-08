using Catalog.API.Data.Repositories.Interfaces;
using Catalog.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Catalog.API.Data.Repositories
{
    public class FormationRepository : Repository<Formation>, IFormationRepository
    {
        public FormationRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Formation> GetFormationWithModulesAsync(int id)
        {
            return await _context.Formations
                .Include(f => f.Modules)
                .FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<IEnumerable<Formation>> GetAllFormationsWithModulesAsync()
        {
            return await _context.Formations
                .Include(f => f.Modules)
                .ToListAsync();
        }
    }
}