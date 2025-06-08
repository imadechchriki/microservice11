using AutoMapper;
using Catalog.API.Data.Repositories.Interfaces;
using Catalog.API.DTOs;
using Catalog.API.Models;
using Catalog.API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Catalog.API.Services
{
    public class ModuleService : IModuleService
    {
        private readonly IModuleRepository _moduleRepository;
        private readonly IFormationRepository _formationRepository;
        private readonly IMapper _mapper;

        public ModuleService(
            IModuleRepository moduleRepository, 
            IFormationRepository formationRepository,
            IMapper mapper)
        {
            _moduleRepository = moduleRepository;
            _formationRepository = formationRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ModuleDto>> GetAllModulesAsync()
        {
            var modules = await _moduleRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<ModuleDto>>(modules);
        }

        public async Task<ModuleDto> GetModuleByIdAsync(int id)
        {
            var module = await _moduleRepository.GetByIdAsync(id);
            if (module == null)
                return null;

            return _mapper.Map<ModuleDto>(module);
        }

        public async Task<IEnumerable<ModuleDto>> GetModulesByFormationIdAsync(int formationId)
        {
            var modules = await _moduleRepository.GetModulesByFormationIdAsync(formationId);
            return _mapper.Map<IEnumerable<ModuleDto>>(modules);
        }

        public async Task<ModuleDto> CreateModuleAsync(CreateModuleDto moduleDto)
        {
            // Check if formation exists
            var formation = await _formationRepository.GetByIdAsync(moduleDto.FormationId);
            if (formation == null)
                return null;

            var module = _mapper.Map<Module>(moduleDto);
            module.CreatedAt = DateTime.UtcNow;
            module.UpdatedAt = DateTime.UtcNow;

            await _moduleRepository.AddAsync(module);
            await _moduleRepository.SaveChangesAsync();

            return _mapper.Map<ModuleDto>(module);
        }

        public async Task<ModuleDto> UpdateModuleAsync(int id, UpdateModuleDto moduleDto)
        {
            var module = await _moduleRepository.GetByIdAsync(id);
            if (module == null)
                return null;

            _mapper.Map(moduleDto, module);
            module.UpdatedAt = DateTime.UtcNow;

            await _moduleRepository.UpdateAsync(module);
            await _moduleRepository.SaveChangesAsync();

            return _mapper.Map<ModuleDto>(module);
        }

        public async Task DeleteModuleAsync(int id)
        {
            var module = await _moduleRepository.GetByIdAsync(id);
            if (module == null)
                return;

            await _moduleRepository.DeleteAsync(module);
            await _moduleRepository.SaveChangesAsync();
        }
    }
}