using System;
using System.Collections.Generic;

namespace Catalog.API.DTOs
{
    public class FormationDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
        public int Credits { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ICollection<ModuleDto> Modules { get; set; }
    }
    
    public class CreateFormationDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
        public int Credits { get; set; }
    }
    
    public class UpdateFormationDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
        public int Credits { get; set; }
    }
}