// Services/IAccountService.cs

// Services/IAccountService.cs
using authentication_system.Models;

namespace authentication_system.Services.Interfaces;

public interface IAccountService
{
    Task<ChangePasswordResult> ChangePasswordAsync(Guid userId, ChangePasswordDTO dto);

}
