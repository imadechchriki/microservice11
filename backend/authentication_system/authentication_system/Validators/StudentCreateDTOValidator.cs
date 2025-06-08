using FluentValidation;
using authentication_system.Models;
using System.Collections.Generic;

public class StudentCreateDTOValidator : AbstractValidator<StudentCreateDTO>
{
    private static readonly HashSet<string> AllowedFilieres = new()
    {
        "GSTR", "GSEA", "GINF", "GIL", "G3EI"
    };

    public StudentCreateDTOValidator()
    {
        RuleFor(s => s.FirstName)
            .NotEmpty().WithMessage("Le prénom est obligatoire.")
            .Length(2, 50).WithMessage("Le prénom doit contenir entre 2 et 50 caractères.")
            .Matches(@"^[\p{L}\p{M} '\-]+$").WithMessage("Le prénom ne doit pas contenir de caractères spéciaux.");

        RuleFor(s => s.LastName)
            .NotEmpty().WithMessage("Le nom est obligatoire.")
            .Length(2, 50).WithMessage("Le nom doit contenir entre 2 et 50 caractères.")
            .Matches(@"^[\p{L}\p{M} '\-]+$").WithMessage("Le nom ne doit pas contenir de caractères spéciaux.");

        RuleFor(s => s.Email)
            .NotEmpty().WithMessage("L'email est obligatoire.")
            .MaximumLength(100).WithMessage("L'e-mail ne doit pas dépasser 100 caractères.")
            .EmailAddress().WithMessage("Format d'email invalide.");

        RuleFor(s => s.Filiere)
            .NotEmpty().WithMessage("La filière est obligatoire.")
            .Must(f => AllowedFilieres.Contains(f.ToUpper()))
            .WithMessage("Filière invalide. Les valeurs acceptées sont : GSTR, GSEA, GINF, GIL, G3EI");
    }
}
