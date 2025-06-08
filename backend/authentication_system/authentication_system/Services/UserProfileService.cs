using authentication_system.Data;
using authentication_system.Models;
using authentication_system.Entities;
using Microsoft.EntityFrameworkCore;

namespace authentication_system.Services;

public class UserProfileService(UserDbContext ctx) : IUserProfileService
{
    public async Task<UserProfile?> GetAsync(Guid userId) =>
        await ctx.UserProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId);

    public async Task<UserProfile?> CreateAsync(Guid userId, UserProfileCreateDTO dto)
    {
        if (await ctx.UserProfiles.AnyAsync(p => p.UserId == userId)) return null;

        var profile = new UserProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PhoneNumber = dto.PhoneNumber,
            CIN = dto.CIN,
            ProfilePictureUrl = dto.ProfilePictureUrl,
            BirthDate = dto.BirthDate.HasValue ? StripTimeAndSetUtc(dto.BirthDate.Value) : null,
            Address = dto.Address,
            AdditionalInfos = dto.AdditionalInfos
        };

        ctx.UserProfiles.Add(profile);
        await ctx.SaveChangesAsync();
        return profile;
    }

    public async Task<UserProfile?> UpdateAsync(Guid userId, UserProfileUpdateDTO dto)
    {
        var profile = await ctx.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return null;

        profile.PhoneNumber = dto.PhoneNumber;
        profile.CIN = dto.CIN;
        profile.ProfilePictureUrl = dto.ProfilePictureUrl;
        profile.BirthDate = dto.BirthDate.HasValue ? StripTimeAndSetUtc(dto.BirthDate.Value) : null;
        profile.Address = dto.Address;
        profile.AdditionalInfos = dto.AdditionalInfos;

        await ctx.SaveChangesAsync();
        return profile;
    }

    public async Task<bool> HasProfileAsync(Guid userId) =>
        await ctx.UserProfiles.AnyAsync(p => p.UserId == userId);

    private static DateTime StripTimeAndSetUtc(DateTime inputDate)
    {
        var dateOnly = inputDate.Date; // garde uniquement jj/mm/aaaa avec 00:00:00
        return DateTime.SpecifyKind(dateOnly, DateTimeKind.Utc);
    }
}
