using authentication_system.Data;
using authentication_system.Entities;
using authentication_system.Services;
using authentication_system.Models;
using authentication_system.Helpers;
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

public class StudentAdminService
{
    private readonly UserDbContext _db;
    private readonly ILogger<StudentAdminService> _logger;
    private readonly IEmailService _emailService;
    private readonly ITokenService _tokenService;

    public StudentAdminService(
        UserDbContext db,
        ILogger<StudentAdminService> logger,
        IEmailService emailService,
        ITokenService tokenService)
    {
        _db = db;
        _logger = logger;
        _emailService = emailService;
        _tokenService = tokenService;
    }

    // CREATE: Prend l'email manuellement et envoie un email de réinitialisation de mot de passe
    public async Task<(StudentResponseDTO? Student, string? Error)> CreateAsync(StudentCreateDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
            return (null, "Le prénom et le nom sont obligatoires.");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return (null, "L'email est obligatoire.");

        if (string.IsNullOrWhiteSpace(dto.Filiere))
            return (null, "La filière est obligatoire.");

        // Vérification du format de l'email
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

        var studentRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Étudiant");
        if (studentRole == null)
            return (null, "Le rôle Étudiant n'existe pas.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            CreatedAt = DateTime.UtcNow,
            RoleId = studentRole.Id
            // Pas de mot de passe initial car nous allons envoyer un lien de réinitialisation
        };

        var profile = new StudentProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Filiere = dto.Filiere
            // Pas de stockage de mot de passe par défaut
        };

        await _db.Users.AddAsync(user);
        await _db.StudentProfiles.AddAsync(profile);
        await _db.SaveChangesAsync();

        // Génération du token de réinitialisation et envoi de l'email
        var resetToken = await _tokenService.GeneratePasswordResetTokenAsync(user.Id);
        await SendPasswordResetEmailAsync(user, resetToken);

        var studentDto = ToDTO(user, profile);
        return (studentDto, null);
    }

    // READ ALL
    public async Task<List<StudentResponseDTO>> GetAllAsync()
    {
        var students = await _db.StudentProfiles
            .Include(sp => sp.User)
            .ToListAsync();

        return students.Select(sp => ToDTO(sp.User, sp)).ToList();
    }

    // READ BY ID
    public async Task<StudentResponseDTO?> GetAsync(Guid id)
    {
        var sp = await _db.StudentProfiles
            .Include(sp => sp.User)
            .FirstOrDefaultAsync(sp => sp.UserId == id);

        return sp == null ? null : ToDTO(sp.User, sp);
    }

    // UPDATE
    public async Task<(bool Success, string? Error)> UpdateAsync(Guid id, StudentUpdateDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
            return (false, "Le prénom et le nom sont obligatoires.");

        if (string.IsNullOrWhiteSpace(dto.Filiere))
            return (false, "La filière est obligatoire.");

        // Validation de l'email s'il est fourni
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            // Vérification du format de l'email
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

            // Vérification que l'email n'est pas déjà utilisé par un autre utilisateur
            var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Id != id);
            if (existingUser != null)
                return (false, "Un autre utilisateur utilise déjà cet email.");
        }

        var student = await _db.StudentProfiles
            .Include(sp => sp.User)
            .FirstOrDefaultAsync(sp => sp.UserId == id);

        if (student == null) return (false, "Étudiant introuvable.");

        student.User.FirstName = dto.FirstName;
        student.User.LastName = dto.LastName;
        student.Filiere = dto.Filiere;

        // Mise à jour de l'email si fourni
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            student.User.Email = dto.Email;
        }

        await _db.SaveChangesAsync();
        return (true, null);
    }

    // DELETE
    public async Task<bool> DeleteAsync(Guid id)
    {
        var student = await _db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == id);
        if (student == null) return false;

        var user = await _db.Users.FindAsync(id);
        if (user != null) _db.Users.Remove(user);

        _db.StudentProfiles.Remove(student);
        await _db.SaveChangesAsync();
        return true;
    }

    // Méthode pour envoyer l'email de réinitialisation de mot de passe
    private async Task SendPasswordResetEmailAsync(User user, string resetToken)
    {
        string resetLink = $"{GetAppBaseUrl()}/reset-password?token={resetToken}&email={Uri.EscapeDataString(user.Email)}";

        string subject = "Bienvenue - Configurez votre compte étudiant";
        string body = $@"
            <html>
            <body>
                <h2>Bienvenue {user.FirstName} {user.LastName},</h2>
                <p>Un compte étudiant a été créé pour vous dans notre système.</p>
                <p>Pour configurer votre mot de passe et accéder à votre compte, veuillez cliquer sur le lien ci-dessous :</p>
                <p><a href=""{resetLink}"">Configurer mon mot de passe</a></p>
                <p>Ce lien est valide pendant 24 heures.</p>
                <p>Si vous n'avez pas demandé ce compte, veuillez ignorer cet email ou contacter l'administrateur.</p>
                <p>Cordialement,<br>L'équipe d'administration</p>
            </body>
            </html>";

        await _emailService.SendEmailAsync(user.Email, subject, body, true);
    }

    // Méthode auxiliaire pour obtenir l'URL de base de l'application
    private string GetAppBaseUrl()
    {
        return Environment.GetEnvironmentVariable("APP_BASE_URL") ?? "http://localhost:5173";
    }

    // Mapping : n'inclut plus de mot de passe par défaut
    private static StudentResponseDTO ToDTO(User user, StudentProfile profile) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,
        Filiere = profile.Filiere
    };

    // Méthode pour importer des étudiants depuis un fichier Excel - mise à jour pour inclure l'email
    public async Task<(int SuccessCount, int ErrorCount, List<string> Errors)> ImportStudentsFromExcelAsync(IFormFile file)
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

                // Vérification des en-têtes (avec Email)
                var headers = new List<string> { "Prénom", "Nom", "Email", "Filière" };
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
                        string filiere = GetCellValueAsString(row.GetCell(3));

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

                        if (string.IsNullOrWhiteSpace(filiere))
                        {
                            errors.Add($"Ligne {i + 1}: La filière est manquante.");
                            errorCount++;
                            continue;
                        }

                        var studentDto = new StudentCreateDTO
                        {
                            FirstName = firstName,
                            LastName = lastName,
                            Email = email,
                            Filiere = filiere
                        };

                        var (student, error) = await CreateAsync(studentDto);

                        if (student != null)
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

    // Méthode utilitaire pour obtenir la valeur d'une cellule en tant que chaîne
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