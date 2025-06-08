// Models/ChangePasswordResult.cs
namespace authentication_system.Models;

public class ChangePasswordResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}
