namespace authentication_system.Services.Interfaces
{
    public interface ITokenService
    {
        Task<string> GeneratePasswordResetTokenAsync(Guid userId);
        Task<(bool IsValid, Guid UserId)> ValidatePasswordResetTokenAsync(string token);
    }
}
