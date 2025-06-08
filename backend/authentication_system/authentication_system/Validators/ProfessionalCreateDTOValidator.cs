using FluentValidation;
using authentication_system.Models;

public class ProfessionalCreateDTOValidator : AbstractValidator<ProfessionalCreateDTO>
{
    public ProfessionalCreateDTOValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Le prénom est obligatoire")
            .Matches(@"^[a-zA-ZÀ-ÿ\-'\s]+$").WithMessage("Le prénom ne doit pas contenir de caractères spéciaux")
            .Length(2, 50).WithMessage("Le prénom doit contenir entre 2 et 50 caractères");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Le nom est obligatoire")
            .Matches(@"^[a-zA-ZÀ-ÿ\-'\s]+$").WithMessage("Le nom ne doit pas contenir de caractères spéciaux")
            .Length(2, 50).WithMessage("Le nom doit contenir entre 2 et 50 caractères");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("L'email est obligatoire")
            .EmailAddress().WithMessage("Format d'email invalide")
            .MaximumLength(100).WithMessage("L'email ne doit pas dépasser 100 caractères");
    }
}
