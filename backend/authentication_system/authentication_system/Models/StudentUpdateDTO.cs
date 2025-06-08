// Models/StudentUpdateDTO.cs
namespace authentication_system.Models;
public class StudentUpdateDTO
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;


    public string? Email { get; set; }

    public string Filiere { get; set; } = string.Empty;

}