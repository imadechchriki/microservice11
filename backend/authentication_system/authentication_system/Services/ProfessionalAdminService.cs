using authentication_system.Data;
using authentication_system.Entities;
using authentication_system.Services;
using authentication_system.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.IO;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using authentication_system.Services.Interfaces;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;

namespace authentication_system.Services;

public class ProfessionalAdminService
{
    private readonly UserDbContext _db;
    private readonly ILogger<ProfessionalAdminService> _logger;
    private readonly IEmailService _emailService;
    private readonly ITokenService _tokenService;

    public ProfessionalAdminService(
        UserDbContext db,
        ILogger<ProfessionalAdminService> logger,
        IEmailService emailService,
        ITokenService tokenService)
    {
        _db = db;
        _logger = logger;
        _emailService = emailService;
        _tokenService = tokenService;
    }

    public async Task<(ProfessionalResponseDTO? Professional, string? Error)> CreateAsync(ProfessionalCreateDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
            return (null, "Le prénom et le nom sont obligatoires.");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return (null, "L'email est obligatoire.");

        try
        {
            var addr = new System.Net.Mail.MailAddress(dto.Email);
            if (addr.Address != dto.Email)
                return (null, "Le format de l'email est incorrect.");
        }
        catch
        {
            return (null, "Le format de l'email est incorrect.");
        }

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return (null, "Un utilisateur avec cet email existe déjà.");

        var professionalRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Professionnel");
        if (professionalRole == null)
            return (null, "Le rôle Professionnel n'existe pas.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            CreatedAt = DateTime.UtcNow,
            RoleId = professionalRole.Id
        };

        var profile = new ProfessionalProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
        };

        await _db.Users.AddAsync(user);
        await _db.ProfessionalProfiles.AddAsync(profile);
        await _db.SaveChangesAsync();

        var professionalDto = ToDTO(user, profile, includePassword: false);
        var resetToken = await _tokenService.GeneratePasswordResetTokenAsync(user.Id);
        await SendPasswordResetEmailAsync(user, resetToken);

        return (professionalDto, null);
    }

    public async Task<List<ProfessionalResponseDTO>> GetAllAsync()
    {
        var professionals = await _db.ProfessionalProfiles
            .Include(pp => pp.User)
            .ToListAsync();

        return professionals.Select(pp => ToDTO(pp.User, pp, includePassword: false)).ToList();
    }

    public async Task<ProfessionalResponseDTO?> GetAsync(Guid id)
    {
        var pp = await _db.ProfessionalProfiles
            .Include(pp => pp.User)
            .FirstOrDefaultAsync(pp => pp.UserId == id);

        return pp == null ? null : ToDTO(pp.User, pp, includePassword: false);
    }

    public async Task<(bool Success, string? Error)> UpdateAsync(Guid id, ProfessionalUpdateDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
            return (false, "Le prénom et le nom sont obligatoires.");

        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(dto.Email);
                if (addr.Address != dto.Email)
                    return (false, "Le format de l'email est incorrect.");
            }
            catch
            {
                return (false, "Le format de l'email est incorrect.");
            }

            var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Id != id);
            if (existingUser != null)
                return (false, "Un autre utilisateur utilise déjà cet email.");
        }

        var professional = await _db.ProfessionalProfiles
            .Include(pp => pp.User)
            .FirstOrDefaultAsync(pp => pp.UserId == id);

        if (professional == null) return (false, "Professionnel introuvable.");

        professional.User.FirstName = dto.FirstName;
        professional.User.LastName = dto.LastName;

        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            professional.User.Email = dto.Email;
        }

        await _db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var professional = await _db.ProfessionalProfiles.FirstOrDefaultAsync(pp => pp.UserId == id);
        if (professional == null) return false;

        var user = await _db.Users.FindAsync(id);
        if (user != null) _db.Users.Remove(user);

        _db.ProfessionalProfiles.Remove(professional);
        await _db.SaveChangesAsync();
        return true;
    }

    private async Task SendPasswordResetEmailAsync(User user, string resetToken)
    {
        string resetLink = $"{GetAppBaseUrl()}/reset-password?token={resetToken}&email={Uri.EscapeDataString(user.Email)}";

        string subject = "Bienvenue - Configurez votre compte professionnel";
        string body = $@"
            <html>
            <body>
                <h2>Bienvenue {user.FirstName} {user.LastName},</h2>
                <p>Un compte professionnel a été créé pour vous dans notre système.</p>
                <p>Pour configurer votre mot de passe et accéder à votre compte, veuillez cliquer sur le lien ci-dessous :</p>
                <p><a href=""{resetLink}"">Configurer mon mot de passe</a></p>
                <p>Ce lien est valide pendant 24 heures.</p>
                <p>Si vous n'avez pas demandé ce compte, veuillez ignorer cet email ou contacter l'administrateur.</p>
                <p>Cordialement,<br>L'équipe d'administration</p>
            </body>
            </html>";

        await _emailService.SendEmailAsync(user.Email, subject, body, true);
    }

    private string GetAppBaseUrl()
    {
        return Environment.GetEnvironmentVariable("APP_BASE_URL") ?? "http://localhost:5173";
    }

    private static ProfessionalResponseDTO ToDTO(User user, ProfessionalProfile profile, bool includePassword = false) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,
    };

    public async Task<(int SuccessCount, int ErrorCount, List<string> Errors)> ImportProfessionalsFromExcelAsync(IFormFile file)
    {
        var extension = Path.GetExtension(file.FileName).ToLower();
        if (extension != ".xlsx" && extension != ".xls")
            return (0, 1, new List<string> { "Le format du fichier n'est pas pris en charge. Utilisez un fichier Excel (.xlsx ou .xls)." });

        int successCount = 0;
        int errorCount = 0;
        var errors = new List<string>();

        try
        {
            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                stream.Position = 0;

                IWorkbook workbook = extension == ".xlsx"
                    ? new XSSFWorkbook(stream)
                    : new HSSFWorkbook(stream);

                ISheet sheet = workbook.GetSheetAt(0);
                if (sheet == null || sheet.LastRowNum == 0)
                    return (0, 1, new List<string> { "Le fichier Excel est vide ou ne contient pas de données valides." });

                var headers = new List<string> { "Prénom", "Nom", "Email" };
                IRow headerRow = sheet.GetRow(0);

                for (int col = 0; col < headers.Count; col++)
                {
                    var headerValue = headerRow.GetCell(col)?.StringCellValue?.Trim();
                    if (string.IsNullOrEmpty(headerValue) || !headerValue.Contains(headers[col], StringComparison.OrdinalIgnoreCase))
                    {
                        errors.Add($"Le format du fichier semble incorrect. En-tête attendu : {headers[col]}");
                    }
                }

                if (errors.Count > 0)
                    return (0, 1, errors);

                for (int i = 1; i <= sheet.LastRowNum; i++)
                {
                    IRow row = sheet.GetRow(i);
                    if (row == null) continue;

                    try
                    {
                        string firstName = GetCellValueAsString(row.GetCell(0));
                        string lastName = GetCellValueAsString(row.GetCell(1));
                        string email = GetCellValueAsString(row.GetCell(2));

                        if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
                        {
                            errors.Add($"Ligne {i + 1}: Le prénom ou le nom est manquant.");
                            errorCount++;
                            continue;
                        }

                        if (string.IsNullOrWhiteSpace(email))
                        {
                            errors.Add($"Ligne {i + 1}: L'email est manquant.");
                            errorCount++;
                            continue;
                        }

                        var professionalDto = new ProfessionalCreateDTO
                        {
                            FirstName = firstName,
                            LastName = lastName,
                            Email = email
                        };

                        var (professional, error) = await CreateAsync(professionalDto);

                        if (professional != null)
                            successCount++;
                        else
                        {
                            errors.Add($"Ligne {i + 1}: {error}");
                            errorCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Erreur lors du traitement de la ligne {i + 1}");
                        errors.Add($"Ligne {i + 1}: Une erreur est survenue - {ex.Message}");
                        errorCount++;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors du traitement du fichier Excel");
            return (0, 1, new List<string> { $"Une erreur est survenue lors du traitement du fichier: {ex.Message}" });
        }

        return (successCount, errorCount, errors);
    }

    private string GetCellValueAsString(ICell cell)
    {
        if (cell == null)
            return string.Empty;

        switch (cell.CellType)
        {
            case CellType.String:
                return cell.StringCellValue?.Trim() ?? string.Empty;
            case CellType.Numeric:
                return cell.NumericCellValue.ToString();
            case CellType.Boolean:
                return cell.BooleanCellValue.ToString();
            case CellType.Formula:
                switch (cell.CachedFormulaResultType)
                {
                    case CellType.String:
                        return cell.StringCellValue?.Trim() ?? string.Empty;
                    case CellType.Numeric:
                        return cell.NumericCellValue.ToString();
                    default:
                        return string.Empty;
                }
            default:
                return string.Empty;
        }
    }
}
