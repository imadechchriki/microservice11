// Models/ChangePasswordDTO.cs
namespace authentication_system.Models;

public class ChangePasswordDTO
{
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}

