using FluentValidation;
using authentication_system.Models;

public class TeacherUpdateDTOValidator : AbstractValidator<TeacherUpdateDTO>
{
    public TeacherUpdateDTOValidator()
    {
        RuleFor(x => x.FirstName)
            .Matches(@"^[a-zA-ZÀ-ÿ\-'\s]*$").When(x => !string.IsNullOrWhiteSpace(x.FirstName))
            .WithMessage("Le prénom ne doit pas contenir de caractères spéciaux");

        RuleFor(x => x.LastName)
            .Matches(@"^[a-zA-ZÀ-ÿ\-'\s]*$").When(x => !string.IsNullOrWhiteSpace(x.LastName))
            .WithMessage("Le nom ne doit pas contenir de caractères spéciaux");

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("Email invalide");
    }
}
