import React, { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import api from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const WelcomeProfileCompletion = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
    phoneNumber: "",
    cin: "",
    profilePictureUrl: "",
    birthDate: "",
    address: "",
    additionalInfos: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [success, setSuccess] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const container = document.querySelector('.welcome-container');
    if (container) {
      container.classList.add('animate-slide-in');
    }

    // Vérifier le rôle dès le chargement
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setRole(userRole);
        
        // Si ce n'est pas un admin, aller directement à l'étape 2
        if (userRole !== "Admin") {
          setStep(2);
        }
      } catch (err) {
        console.error("Token invalide", err);
        navigate("/login");
      }
    } else {
      // Si pas de token, rediriger vers login
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur pour ce champ quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validatePasswordStep = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = "Le mot de passe est requis";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfileStep = () => {
    const newErrors = {};
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Numéro de téléphone requis";
    }
    
    if (!formData.cin.trim()) {
      newErrors.cin = "CIN requis";
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = "Date de naissance requise";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Adresse requise";
    }
    
    if (!formData.profilePictureUrl) {
      newErrors.profilePictureUrl = "Photo de profil requise";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    // Si ce n'est pas un admin, ne pas permettre le changement de mot de passe
    if (role !== "Admin") {
      setStep(2);
      return;
    }

    if (step === 1 && validatePasswordStep()) {
      setIsLoading(true);
      try {
        await api.post("/Account/change-password", {
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        });
        
        setStep(2);
        
        // Animation pour la transition
        const container = document.querySelector('.form-container');
        if (container) {
          container.classList.remove('animate-slide-in');
          setTimeout(() => container.classList.add('animate-slide-in'), 10);
        }
      } catch (error) {
        let errorMessage = "Erreur lors du changement de mot de passe";
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
          // Gestion des erreurs de validation du serveur
          const serverErrors = error.response.data.errors;
          const newErrors = {};
          
          Object.keys(serverErrors).forEach(key => {
            newErrors[key.toLowerCase()] = serverErrors[key][0];
          });
          
          setErrors(prev => ({ ...prev, ...newErrors }));
          return;
        }
        
        setErrors(prev => ({ ...prev, newPassword: errorMessage }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, profilePictureUrl: "Veuillez sélectionner un fichier image valide." }));
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, profilePictureUrl: "Le fichier est trop volumineux (max 5MB)." }));
      return;
    }

    // Créer l'aperçu
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);

    // Upload du fichier
    const imageFormData = new FormData();
    imageFormData.append('file', file);
    
    setIsLoading(true);
    
    try {
      const response = await api.post('/UserProfile/upload-picture', imageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFormData(prev => ({ ...prev, profilePictureUrl: response.data.url }));
      setUploaded(true);
      
      // Effacer l'erreur si l'upload réussit
      if (errors.profilePictureUrl) {
        setErrors(prev => ({ ...prev, profilePictureUrl: null }));
      }
    } catch (error) {
      let errorMessage = "Erreur lors de l'upload de l'image.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrors(prev => ({ ...prev, profilePictureUrl: errorMessage }));
      setPreviewImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateProfileStep()) {
      setIsLoading(true);
      
      try {
        await api.post("/UserProfile", {
          phoneNumber: formData.phoneNumber.trim(),
          cin: formData.cin.trim(),
          profilePictureUrl: formData.profilePictureUrl,
          birthDate: formData.birthDate,
          address: formData.address.trim(),
          additionalInfos: formData.additionalInfos.trim() || null
        });
        
        setSuccess(true);
        setTimeout(() => navigate("/redirect"), 2000);
      } catch (error) {
        let errorMessage = "Erreur lors de la soumission du profil";
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
          // Gestion des erreurs de validation du serveur
          const serverErrors = error.response.data.errors;
          const newErrors = {};
          
          Object.keys(serverErrors).forEach(key => {
            const fieldName = key.toLowerCase();
            newErrors[fieldName] = serverErrors[key][0];
          });
          
          setErrors(prev => ({ ...prev, ...newErrors }));
          return;
        }
        
        setErrors(prev => ({ ...prev, general: errorMessage }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBackToStep1 = () => {
    if (role === "Admin") {
      setStep(1);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center px-6 py-8">
      <div className="welcome-container w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 opacity-0 transform translate-y-4 relative">
        
        {/* Success message */}
        {success && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-10 animate-fade-in">
            <div className="bg-green-100 rounded-full p-3 mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900">Profil complété avec succès!</h3>
            <p className="text-gray-600 mt-2">Redirection vers votre tableau de bord...</p>
          </div>
        )}
        
        {/* Header */}
        <div className="bg-purple-700 py-6 px-8 text-white text-center">
          <h1 className="text-2xl font-bold">Welcome, please complete your profile</h1>
          
          {/* Progress steps - only show for Admin */}
          {role === "Admin" && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-white text-purple-700' : 'bg-purple-500 text-white'} font-bold`}>
                  1
                </div>
                <div className={`w-12 h-1 ${step >= 2 ? 'bg-white' : 'bg-purple-500'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-white text-purple-700' : 'bg-purple-500 text-white'} font-bold`}>
                  2
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-8">
          {/* Afficher les erreurs générales */}
          {errors.general && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}
          
          <div className="form-container transition-all duration-500 animate-slide-in">
            {step === 1 && role === "Admin" ? (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Étape 1: Changement de mot de passe</h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm text-gray-700 font-medium">
                      Nouveau mot de passe *
                    </label>
                    <div className="mt-1">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        className={`block w-full rounded-md border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm`}
                        placeholder="Entrez votre nouveau mot de passe"
                      />
                      {errors.newPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm text-gray-700 font-medium">
                      Confirmer le mot de passe *
                    </label>
                    <div className="mt-1">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className={`block w-full rounded-md border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm`}
                        placeholder="Confirmez votre mot de passe"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={isLoading}
                      className="flex w-full justify-center rounded-md bg-purple-700 px-4 py-2 text-white font-semibold hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Chargement...
                        </span>
                      ) : (
                        "Suivant"
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  {role === "Admin" ? "Étape 2: Informations personnelles" : "Informations personnelles"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Profile Picture Upload */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative w-32 h-32 mb-4">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-purple-200">
                          <Camera size={40} className="text-gray-400" />
                        </div>
                      )}
                      {isLoading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    
                    <label htmlFor="profilePicture" className="cursor-pointer bg-purple-100 text-purple-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
                      {uploaded ? "Changer la photo" : "Ajouter une photo *"}
                      <input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    {errors.profilePictureUrl && (
                      <p className="mt-2 text-sm text-red-600 text-center">{errors.profilePictureUrl}</p>
                    )}
                  </div>
                  
                  {/* Two columns for desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm text-gray-700 font-medium">
                        Numéro de téléphone *
                      </label>
                      <div className="mt-1">
                        <input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          required
                          className={`block w-full rounded-md border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm`}
                          placeholder="Ex: +212 6 12 34 56 78"
                        />
                        {errors.phoneNumber && (
                          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cin" className="block text-sm text-gray-700 font-medium">
                        CIN *
                      </label>
                      <div className="mt-1">
                        <input
                          id="cin"
                          name="cin"
                          type="text"
                          value={formData.cin}
                          onChange={handleChange}
                          required
                          className={`block w-full rounded-md border ${errors.cin ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm`}
                          placeholder="Ex: AB123456"
                        />
                        {errors.cin && (
                          <p className="mt-1 text-sm text-red-600">{errors.cin}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="birthDate" className="block text-sm text-gray-700 font-medium">
                        Date de naissance *
                      </label>
                      <div className="mt-1">
                        <input
                          id="birthDate"
                          name="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={handleChange}
                          required
                          className={`block w-full rounded-md border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm`}
                        />
                        {errors.birthDate && (
                          <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm text-gray-700 font-medium">
                        Adresse *
                      </label>
                      <div className="mt-1">
                        <input
                          id="address"
                          name="address"
                          type="text"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          className={`block w-full rounded-md border ${errors.address ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm`}
                          placeholder="Votre adresse complète"
                        />
                        {errors.address && (
                          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="additionalInfos" className="block text-sm text-gray-700 font-medium">
                      Informations supplémentaires (optionnel)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="additionalInfos"
                        name="additionalInfos"
                        rows={3}
                        value={formData.additionalInfos}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        placeholder="Ajoutez toute information supplémentaire..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {role === "Admin" && (
                      <button
                        type="button"
                        onClick={handleBackToStep1}
                        className="flex-1 justify-center rounded-md border border-purple-700 px-4 py-2 text-purple-700 font-semibold hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                      >
                        Retour
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`${role === "Admin" ? 'flex-1' : 'w-full'} justify-center rounded-md bg-purple-700 px-4 py-2 text-white font-semibold hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enregistrement...
                        </span>
                      ) : (
                        "Terminer"
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeProfileCompletion;