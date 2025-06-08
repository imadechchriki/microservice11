using AutoMapper;
using Catalog.API.DTOs;
using Catalog.API.Models;

namespace Catalog.API.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Formation mappings
            CreateMap<Formation, FormationDto>();
            CreateMap<CreateFormationDto, Formation>();
            CreateMap<UpdateFormationDto, Formation>();
            
            // Module mappings
            CreateMap<Module, ModuleDto>();
            CreateMap<CreateModuleDto, Module>();
            CreateMap<UpdateModuleDto, Module>();
        }
    }
}