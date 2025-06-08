namespace Questionnaire.Domain.Entities;

public class FakeUser
{
    public int UserId { get; set; }
    public string Role { get; set; }  // Roles like "Student", "Professor", "Professional"
    public string Email { get; set; } // User's email address for testing purposes

    public FakeUser(int userId, string role, string email)
    {
        UserId = userId;
        Role = role;
        Email = email;
    }
}
