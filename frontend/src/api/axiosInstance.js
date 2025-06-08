import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Vérifier si l'erreur est due à un token expiré (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Si un refresh est déjà en cours, mettre la requête en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/Auth/refresh-token`, 
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken, expiration } = response.data;
        
        // Mettre à jour les tokens dans le stockage
        Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'Strict' });
        Cookies.set('tokenExpiration', expiration, { secure: true, sameSite: 'Strict' });
        localStorage.setItem('refreshToken', newRefreshToken);

        // Traiter la file d'attente des requêtes
        processQueue(null, accessToken);

        // Retenter la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // En cas d'échec du rafraîchissement, vider la file d'attente
        processQueue(refreshError, null);
        
        // Supprimer les tokens périmés
        Cookies.remove('accessToken');
        Cookies.remove('tokenExpiration');
        localStorage.removeItem('refreshToken');
        
        // Rediriger vers la page de login seulement s'il s'agit d'une réelle erreur d'authentification
        // Les codes 401 et 403 indiquent un problème d'authentification/autorisation
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          // Utiliser un délai pour éviter les redirections multiples
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 100);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;