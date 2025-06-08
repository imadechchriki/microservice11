import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';

function Reset() {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Récupérer le token et l'email depuis l'URL au chargement du composant
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    const emailParam = params.get('email');

    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Token de réinitialisation manquant. Veuillez vérifier votre lien.");
    }
    if (emailParam) setEmail(emailParam);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPass !== confirmPass) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPass.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.post(`${apiUrl}/auth/reset-password`, {
        token: token,
        password: newPass,
        confirmPassword: confirmPass
      });

      setMessage("Votre mot de passe a été réinitialisé avec succès.");
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else if (error.response && error.response.status === 400) {
        setError("Le lien de réinitialisation est invalide ou a expiré.");
      } else {
        setError("Une erreur est survenue lors de la réinitialisation du mot de passe.");
      }
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  from-blue-900 via-blue-700 to-blue-900  flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">

            {/* Left - Form */}
            <div className="flex-1 p-8 lg:p-12 flex items-center justify-center">
              <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    Réinitialiser votre mot de passe
                  </h2>
                  <p className="text-gray-300">
                    Saisissez un nouveau mot de passe
                  </p>
                </div>

                {/* Token Missing */}
                {!token ? (
                  <div className="bg-yellow-400/10 border border-yellow-500/30 text-yellow-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm text-center">
                    Le lien de réinitialisation est invalide. Veuillez vérifier votre email ou demander un nouveau lien.
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
                    {/* New Password Field */}
                    <div className="space-y-2">
                      <label htmlFor="newPass" className="block text-sm font-medium text-gray-200">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="newPass"
                          name="newPass"
                          type={showPass ? "text" : "password"}
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          required
                          className="block w-full pl-10 pr-12 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Nouveau mot de passe"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPass(!showPass)}
                          tabIndex={-1}
                        >
                          {showPass ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <label htmlFor="confirmPass" className="block text-sm font-medium text-gray-200">
                        Confirmez le mot de passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPass"
                          name="confirmPass"
                          type={showConfirm ? "text" : "password"}
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          required
                          className="block w-full pl-10 pr-12 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Confirmez le mot de passe"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirm(!showConfirm)}
                          tabIndex={-1}
                        >
                          {showConfirm ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Error / Success Message */}
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                        {error}
                      </div>
                    )}
                    {message && (
                      <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                        {message}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          Réinitialiser
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right - Image / Info */}
            
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px);}
          50% { transform: translateY(-20px);}
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Reset;
