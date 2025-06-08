namespace Questionnaire.Domain.Entities;

public sealed class FormationCache
{public int Id { get; private set; }
        
        // Fields from Formation service
        public string Title { get; set; }    // Renamed from 'Name' to match the Formation service
        public string Description { get; set; }
        public string Code { get; set; }
        public int Credits { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
 
}

