namespace authentication_system.Models;

public class StudentCreateDTO
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName  { get; set; } = string.Empty;
    public string Email     { get; set; } = string.Empty;
    public string Filiere   { get; set; } = string.Empty;
}
