using FluentValidation;
using authentication_system.Models;

public class StudentUpdateDTOValidator : AbstractValidator<StudentUpdateDTO>
{
    public StudentUpdateDTOValidator()
    {
        RuleFor(x => x.FirstName)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().When(x => !string.IsNullOrWhiteSpace(x.FirstName))
            .WithMessage("Le prénom ne doit pas être vide s'il est fourni.")
            .Matches(@"^[a-zA-ZÀ-ÿ\-'\s]+$").When(x => !string.IsNullOrWhiteSpace(x.FirstName))
            .WithMessage("Le prénom ne doit pas contenir de caractères spéciaux");

        RuleFor(x => x.LastName)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().When(x => !string.IsNullOrWhiteSpace(x.LastName))
            .WithMessage("Le nom ne doit pas être vide s'il est fourni.")
            .Matches(@"^[a-zA-ZÀ-ÿ\-'\s]+$").When(x => !string.IsNullOrWhiteSpace(x.LastName))
            .WithMessage("Le nom ne doit pas contenir de caractères spéciaux");

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("Email invalide");

        RuleFor(x => x.Filiere)
            .Must(f => string.IsNullOrEmpty(f) || new[] { "GSTR", "GSEA", "GINF", "GIL", "G3EI" }.Contains(f.ToUpper()))
            .WithMessage("Filière invalide. Valeurs autorisées : GSTR, GSEA, GINF, GIL, G3EI");
    }
}
