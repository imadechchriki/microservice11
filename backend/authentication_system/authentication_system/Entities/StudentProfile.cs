namespace authentication_system.Entities;

public class StudentProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Filiere { get; set; } = string.Empty;



}
