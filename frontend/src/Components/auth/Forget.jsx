import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import axios from "axios"; // n'oublie pas d'installer axios si tu l'utilises

function Forget() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      // Remplace l'URL par celle de ton API réelle
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forget-password`, { email });
      // Simule la logique que tu veux selon la structure de réponse de ton backend
      if (response.data && response.data.exists) {
        setMessage("Veuillez vérifier votre boîte email !");
      } else {
        setError("Email non trouvé. Veuillez vérifier votre saisie.");
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer plus tard.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  from-blue-900 via-blue-700 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(18)].map((_, i) => (
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

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[450px]">
            {/* Left - Form */}
            <div className="flex-1 p-8 lg:p-12 flex items-center justify-center">
              <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Réinitialiser votre mot de passe
                  </h2>
                  <p className="text-gray-300">
                    Entrez votre email pour recevoir le lien de réinitialisation
                  </p>
                </div>
                {/* Form */}
                <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                      Adresse email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                  {/* Error / Success Message */}
                  {(message || error) && (
                    <div className={`px-4 py-3 rounded-lg text-sm backdrop-blur-sm ${
                      message ? "bg-green-500/20 border border-green-500/30 text-green-200" : "bg-red-500/20 border border-red-500/30 text-red-200"
                    }`}>
                      {message || error}
                    </div>
                  )}
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Valider
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </button>
                </form>
                {/* Back to login */}
                <div className="text-center pt-2">
                  <a href="/login" className="text-purple-300 hover:text-purple-200 font-medium transition-colors duration-200 text-sm">
                    Retour à la connexion
                  </a>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Particles animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px);}
          50% { transform: translateY(-18px);}
        }
        .animate-float {
          animation: float 5.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Forget;
