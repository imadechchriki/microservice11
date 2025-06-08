using System;
using System.Collections.Generic;

namespace Catalog.API.Models
{
    public class Formation
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
        public int Credits { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Navigation property
        public ICollection<Module> Modules { get; set; } = new List<Module>();
    }
}