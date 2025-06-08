namespace authentication_system.Entities;

public class ProfessionalProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;


}
