using System;

namespace Catalog.API.Models
{
    public class Module
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
        public int Hours { get; set; }
        public int Credits { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Foreign key
        public int FormationId { get; set; }
        
        // Navigation property
        public Formation Formation { get; set; }
    }
}