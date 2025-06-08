using FluentValidation;
using authentication_system.Models;

public class UserProfileCreateDTOValidator : AbstractValidator<UserProfileCreateDTO>
{
    public UserProfileCreateDTOValidator()
    {
        RuleFor(x => x.PhoneNumber)
            .Matches(@"^[0-9+\-\s()]*$").When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber))
            .WithMessage("Numéro de téléphone invalide");

        RuleFor(x => x.BirthDate)
            .Must(BeBefore2007).When(x => x.BirthDate.HasValue)
            .WithMessage("La date de naissance doit être antérieure à 2007");

        RuleFor(x => x.CIN)
            .MaximumLength(20).When(x => !string.IsNullOrWhiteSpace(x.CIN))
            .WithMessage("Le CIN ne doit pas dépasser 20 caractères");

        RuleFor(x => x.Address)
            .MaximumLength(150).When(x => !string.IsNullOrWhiteSpace(x.Address));

        RuleFor(x => x.AdditionalInfos)
            .MaximumLength(300).When(x => !string.IsNullOrWhiteSpace(x.AdditionalInfos));

        RuleFor(x => x.ProfilePictureUrl)
            .Must(url => string.IsNullOrEmpty(url) || Uri.IsWellFormedUriString(url, UriKind.Absolute))
            .WithMessage("L'URL de la photo de profil est invalide");
    }

    private bool BeBefore2007(DateTime? date)
    {
        return date < new DateTime(2007, 1, 1);
    }
}
