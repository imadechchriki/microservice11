namespace authentication_system.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 🔐 Rôle unique
        public Guid RoleId { get; set; }
        public Role Role { get; set; } = null!;

        // 🔄 Navigation
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public UserProfile? Profile { get; set; }
        public StudentProfile? StudentProfile { get; set; }
        public TeacherProfile? TeacherProfile { get; set; }
        public ProfessionalProfile? ProfessionalProfile { get; set; }
    }
}
