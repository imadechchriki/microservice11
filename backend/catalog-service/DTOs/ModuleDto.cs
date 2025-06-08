using System;

namespace Catalog.API.DTOs
{
    public class ModuleDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
        public int Hours { get; set; }
        public int Credits { get; set; }
        public int FormationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
    
    public class CreateModuleDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
        public int Hours { get; set; }
        public int Credits { get; set; }
        public int FormationId { get; set; }
    }
    
    public class UpdateModuleDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
        public int Hours { get; set; }
        public int Credits { get; set; }
    }
}