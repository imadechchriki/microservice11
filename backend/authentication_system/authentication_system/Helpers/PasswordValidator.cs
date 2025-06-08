// Helpers/PasswordValidator.cs
using System.Text.RegularExpressions;

namespace authentication_system.Helpers;

public static class PasswordValidator
{
    public static bool IsStrongPassword(string password, out string error)
    {
        error = string.Empty;

        if (password.Length < 8)
        {
            error = "Le mot de passe doit contenir au moins 8 caract�res.";
            return false;
        }

        if (!Regex.IsMatch(password, "[A-Z]"))
        {
            error = "Le mot de passe doit contenir au moins une lettre majuscule.";
            return false;
        }

        if (!Regex.IsMatch(password, "[a-z]"))
        {
            error = "Le mot de passe doit contenir au moins une lettre minuscule.";
            return false;
        }

        if (!Regex.IsMatch(password, "[0-9]"))
        {
            error = "Le mot de passe doit contenir au moins un chiffre.";
            return false;
        }

        if (!Regex.IsMatch(password, "[^a-zA-Z0-9]"))
        {
            error = "Le mot de passe doit contenir au moins un caract�re sp�cial.";
            return false;
        }

        return true;
    }
}
