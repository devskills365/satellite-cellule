// src/api/axiosConfig.js
import axios from 'axios';
import toast from 'react-hot-toast';

// ── BaseURL robuste ───────────────────────────────────────────
// On détecte l'environnement par le hostname réel,
// pas par import.meta.env.DEV qui peut être instable au build.
const isLocalhost = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '0.0.0.0'
);

const baseURL = isLocalhost
  ? `http://localhost:5000/api`
  : (import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`);

console.log('[axiosConfig] baseURL =', baseURL);

const apiClient = axios.create({ baseURL, timeout: 120000 });

// ── Intercepteur request ──────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const url   = config.url || "";
    const token = url.startsWith('/bo/')
      ? localStorage.getItem('bo_token')
      : localStorage.getItem('sgi_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Intercepteur response ─────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, code } = error;
    if (!response) {
      toast.error(code === 'ECONNABORTED' ? "Délai dépassé." : "Connexion impossible.");
      return Promise.reject(error);
    }
    const status = response.status;
    const path   = window.location.pathname;
    if (status === 401 || status === 403) {
      if (path.startsWith('/backoffice') && !path.includes('/backoffice/login')) {
        if (localStorage.getItem('bo_token')) {
          localStorage.removeItem('bo_token');
          localStorage.removeItem('bo_user');
          toast.error("Session expirée.");
          window.location.href = '/backoffice/login';
        }
      } else if (path.startsWith('/sgi') && !path.includes('/sgi/login')) {
        localStorage.removeItem('sgi_token');
        localStorage.removeItem('sgi_user_role');
        toast.error("Session expirée.");
        window.location.href = '/sgi/login';
      }
    } else if (status === 413) {
      toast.error("Fichier trop volumineux.");
    } else {
      toast.error(response.data?.message || `Erreur serveur (${status})`);
    }
    return Promise.reject(error);
  }
);

// ============================================================
// SERVICES
// ============================================================

export const s3Service = {
  getPresignedUrl: async () => {
    const { data } = await apiClient.get('/s3/generate-url');
    return data;
  },
  uploadFile: async (presignedUrl, file) => {
    return axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (p) =>
        console.log(`Upload : ${Math.round((p.loaded * 100) / p.total)}%`),
    });
  },
};

export const wsfService = {
  getAllCells:     (params = {}) => apiClient.get('/wsf/cells', { params }).then(r => r.data),
  getCellById:    (id)           => apiClient.get(`/wsf/cells/${id}`).then(r => r.data),
  createCell:     (data)         => apiClient.post('/wsf/cells', data).then(r => r.data),
  updateCell:     (id, updates)  => apiClient.put(`/wsf/cells/${id}`, updates).then(r => r.data),
  deleteCell:     (id)           => apiClient.delete(`/wsf/cells/${id}`),
  getAllServants:  (params = {}) => apiClient.get('/wsf/servants', { params }).then(r => r.data),
  getServantById: (id)           => apiClient.get(`/wsf/servants/${id}`).then(r => r.data),
  createServant:  (data)         => apiClient.post('/wsf/servants', data).then(r => r.data),
  updateServant:  (id, updates)  => apiClient.put(`/wsf/servants/${id}`, updates).then(r => r.data),
  deleteServant:  (id)           => apiClient.delete(`/wsf/servants/${id}`),
};

export const boAuthService = {
  login: (email, mot_de_passe) =>
    apiClient.post('/bo/auth/login', { email, mot_de_passe }).then(r => r.data),
  me: () => apiClient.get('/bo/auth/me').then(r => r.data),
};

export const boCommandesService = {
  listerAvecLignes: (statut = null) =>
    apiClient.get('/bo/commandes', {
      params: { ...(statut ? { statut } : {}), lignes: true }
    }).then(r => r.data),
  lister: (statut = null) =>
    apiClient.get('/bo/commandes', {
      params: { ...(statut ? { statut } : {}), lignes: false }
    }).then(r => r.data),
  detail:        (id)         => apiClient.get(`/bo/commandes/${id}`).then(r => r.data),
  changerStatut: (id, statut) => apiClient.patch(`/bo/commandes/${id}/statut`, { statut }).then(r => r.data),
  stats:         ()           => apiClient.get('/bo/stats').then(r => r.data),
};

export const commandeClientService = {
  soumettre: (payload) => apiClient.post('/commandes', payload).then(r => r.data),
};

export const commandeSuiviService = {
  suivi:   (commandeId) => apiClient.get(`/commandes/${commandeId}/suivi`).then(r => r.data),
  annuler: (commandeId) => apiClient.post(`/commandes/${commandeId}/suivi`).then(r => r.data),
};

export const boMenuService = {
  listerArticles:   ()          => apiClient.get('/bo/menu/articles').then(r => r.data),
  creerArticle:     (data)      => apiClient.post('/bo/menu/articles', data).then(r => r.data),
  modifierArticle:  (id, data)  => apiClient.put(`/bo/menu/articles/${id}`, data).then(r => r.data),
  toggleDisponible: (id, dispo) => apiClient.patch(`/bo/menu/articles/${id}`, { disponible: dispo }).then(r => r.data),
  supprimerArticle: (id)        => apiClient.delete(`/bo/menu/articles/${id}`).then(r => r.data),
};

export const boCategoriesService = {
  lister:    ()         => apiClient.get('/bo/menu/categories').then(r => r.data),
  creer:     (data)     => apiClient.post('/bo/menu/categories', data).then(r => r.data),
  modifier:  (id, data) => apiClient.put(`/bo/menu/categories/${id}`, data).then(r => r.data),
  supprimer: (id)       => apiClient.delete(`/bo/menu/categories/${id}`).then(r => r.data),
};

export const boTablesService = {
  lister:    ()     => apiClient.get('/bo/tables').then(r => r.data),
  detail:    (id)   => apiClient.get(`/bo/tables/${id}`).then(r => r.data),
  creer:     (data) => apiClient.post('/bo/tables', data).then(r => r.data),
  supprimer: (id)   => apiClient.delete(`/bo/tables/${id}`).then(r => r.data),
};

export const boCuisineService = {
  statsSommatives: () => apiClient.get('/bo/stats/cuisine').then(r => r.data),
};

export const boAnalyticsService = {
  charger:       (periode = "jour") =>
    apiClient.get('/bo/analytics', { params: { periode } }).then(r => r.data),
  chargerDurees: (periode = "jour") =>
    apiClient.get('/bo/stats/durees', { params: { periode } }).then(r => r.data),
};

export const menuPublicService = {
  charger: (restaurantId) =>
    apiClient.get(`/restaurants/${restaurantId}/menu`).then(r => r.data),
};

export const boS3Service = {
  uploadImage: async (file, onProgress = null) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post('/bo/s3/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (p) => {
        const pct = Math.round((p.loaded * 100) / p.total);
        if (onProgress) onProgress(pct);
      },
    });
    return data;
  },
};

export const boRestaurantService = {
  get:    ()     => apiClient.get('/bo/restaurant').then(r => r.data),
  update: (data) => apiClient.put('/bo/restaurant', data).then(r => r.data),
};

export const boStaffService = {
  lister:        ()          => apiClient.get('/bo/staff').then(r => r.data),
  creer:         (data)      => apiClient.post('/bo/staff', data).then(r => r.data),
  modifier:      (id, data)  => apiClient.put(`/bo/staff/${id}`, data).then(r => r.data),
  supprimer:     (id)        => apiClient.delete(`/bo/staff/${id}`).then(r => r.data),
  resetPassword: (id)        => apiClient.post(`/bo/staff/${id}/reset-password`).then(r => r.data),
};

export default apiClient;