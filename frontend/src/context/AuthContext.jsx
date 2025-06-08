import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import api from '../api/axiosInstance';

// Constante pour mapper les claims JWT de .NET
const ClaimTypes = {
  Role: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuthToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/Auth/refresh-token`, 
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken, expiration } = response.data;
      
      // Mettre à jour les tokens
      Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'Strict' });
      Cookies.set('tokenExpiration', expiration, { secure: true, sameSite: 'Strict' });
      localStorage.setItem('refreshToken', newRefreshToken);
      
      const decoded = jwtDecode(accessToken);
      setUser({ 
        email: decoded.email, 
        role: decoded[ClaimTypes.Role] || decoded.role // Compatibilité avec le ClaimTypes.Role de votre backend
      });
      
      console.log("Token refreshed successfully until", new Date(expiration).toLocaleTimeString());
      return true;
    } catch (error) {
      console.error("Échec du rafraîchissement du token:", error);
      return false;
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/Auth/login', { email, password });
    const { accessToken, refreshToken, expiration } = response.data;

    Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'Strict' });
    Cookies.set('tokenExpiration', expiration, { secure: true, sameSite: 'Strict' });
    localStorage.setItem('refreshToken', refreshToken);

    const decoded = jwtDecode(accessToken);
    setUser({ email: decoded.email, role: decoded.role });
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
  
    try {
      if (refreshToken) {
        await api.post('/Auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error.response?.data || error.message);
    } finally {
      // Supprimer tous les tokens du client
      Cookies.remove('accessToken');
      Cookies.remove('tokenExpiration');
      localStorage.removeItem('refreshToken');
      setUser(null);
      // Rediriger vers la page de login
      window.location.href = '/login';
    }
  };
  
  const isAuthenticated = () => {
    const token = Cookies.get('accessToken');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      // Ajouter une marge de 10 secondes pour éviter les problèmes de timing
      const isValid = decoded.exp * 1000 > Date.now() - 10000;
      
      // Si le token est proche de l'expiration, essayer de le rafraîchir en arrière-plan
      if (decoded.exp * 1000 < Date.now() + 60000) {
        refreshAuthToken().catch(console.error);
      }
      
      return isValid;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const token = Cookies.get('accessToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const decoded = jwtDecode(token);
        
        if (decoded.exp * 1000 > Date.now()) {
          // Token valide
          setUser({ email: decoded.email, role: decoded.role });
        } else {
          // Token expiré, essayer de rafraîchir
          const refreshed = await refreshAuthToken();
          if (!refreshed) {
            await logout();
          }
        }
      } catch (error) {
        console.error("Erreur d'authentification:", error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Mettre en place un intervalle pour vérifier la validité du token
    // Avec 15 minutes d'expiration, vérifier toutes les 5 minutes est raisonnable
    const interval = setInterval(() => {
      const token = Cookies.get('accessToken');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Si le token expire dans moins de 2 minutes, le rafraîchir
          if (decoded.exp * 1000 < Date.now() + 120000) {
            refreshAuthToken().catch(console.error);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du token:", error);
        }
      }
    }, 300000); // Vérifier toutes les 5 minutes (300000ms)
    
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      refreshAuthToken,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);