import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import api from "../../api/axiosInstance";

const FirstLoginRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("accessToken");

    if (!token) {
      navigate("/login");
      return;
    }

    let role;
    try {
      const decoded = jwtDecode(token);
      role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    } catch (err) {
      console.error("Token invalide", err);
      navigate("/login");
      return;
    }

    const checkProfileExists = async () => {
      try {
        const response = await api.get("/UserProfile/exists");
        const exists = response.data.hasProfile === true;

        if (!exists) {
          navigate("/ProfileCompletion");
        } else {
          switch (role) {
            case "Admin":
              navigate("/admin");
              break;
            case "Étudiant":
              navigate("/etudiant/dashboard");
              break;
            case "Enseignant":
              navigate("/enseignant/dashboard");
              break;
            case "Professionnel":
              navigate("/pro/dashboard");
              break;
            default:
              navigate("/dashboard");
              break;
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du profil", error);
        navigate("/login");
      }
    };

    checkProfileExists();
  }, [navigate]);

  return null;
};

export default FirstLoginRedirect;
