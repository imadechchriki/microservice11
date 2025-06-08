using FluentValidation;
using authentication_system.Models;

public class TeacherCreateDTOValidator : AbstractValidator<TeacherCreateDTO>
{
    public TeacherCreateDTOValidator()
    {
        RuleFor(t => t.FirstName)
            .NotEmpty().WithMessage("Le prénom est obligatoire.")
            .Length(2, 50).WithMessage("Le prénom doit contenir entre 2 et 50 caractères.")
            .Matches(@"^[\p{L}\p{M} '\-]+$").WithMessage("Le prénom ne doit pas contenir de caractères spéciaux.");

        RuleFor(t => t.LastName)
            .NotEmpty().WithMessage("Le nom est obligatoire.")
            .Length(2, 50).WithMessage("Le nom doit contenir entre 2 et 50 caractères.")
            .Matches(@"^[\p{L}\p{M} '\-]+$").WithMessage("Le nom ne doit pas contenir de caractères spéciaux.");

        RuleFor(t => t.Email)
            .NotEmpty().WithMessage("L'email est obligatoire.")
            .MaximumLength(100).WithMessage("L'email ne doit pas dépasser 100 caractères.")
            .EmailAddress().WithMessage("Format d'email invalide.");
    }
}
