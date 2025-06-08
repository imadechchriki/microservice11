namespace authentication_system.Entities
{
    public class Role
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty; // Student, Teacher, Pro, Admin
        public string? Description { get; set; }


    }
}
