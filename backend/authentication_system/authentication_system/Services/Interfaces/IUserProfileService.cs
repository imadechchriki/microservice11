using authentication_system.Models;
using authentication_system.Entities;

namespace authentication_system.Services;

public interface IUserProfileService
{
    Task<UserProfile?> GetAsync(Guid userId);
    Task<UserProfile?> CreateAsync(Guid userId, UserProfileCreateDTO dto);
    Task<UserProfile?> UpdateAsync(Guid userId, UserProfileUpdateDTO dto);
    Task<bool> HasProfileAsync(Guid userId);

}
