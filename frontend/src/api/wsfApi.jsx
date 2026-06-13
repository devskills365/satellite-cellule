// src/api/wsfService.jsx
import apiClient from './axiosConfig'; 

// ────────────────────────────────────────────────
// CELLULES (WSFCellResource)
// ────────────────────────────────────────────────

export const getAllCells = async () => {
  try {
    const { data } = await apiClient.get('/wsf/cells');
    return data; // généralement { cells: [...], count: ..., etc. }
  } catch (error) {
    throw error; // l'intercepteur gère déjà le toast
  }
};

export const getCellById = async (cellId) => {
  return apiClient.get(`/wsf/cells/${cellId}`).then(res => res.data);
};

export const createCell = async (cellData) => {
  // cellData = { nom_cellule, quartier, latitude, longitude, statut, ... }
  return apiClient.post('/wsf/cells', cellData).then(res => res.data);
};

export const updateCell = async (cellId, updates) => {
  return apiClient.put(`/wsf/cells/${cellId}`, updates).then(res => res.data);
  // ou patch si ton backend supporte PATCH
  // return apiClient.patch(`/wsf/cells/${cellId}`, updates)...
};

export const deleteCell = async (cellId) => {
  return apiClient.delete(`/wsf/cells/${cellId}`);
};

// ────────────────────────────────────────────────
// SERVANTS / UTILISATEURS (WSFUserResource)
// ────────────────────────────────────────────────

export const getAllServants = async (params = {}) => {
  // params = { cell_id: "...", role: "leader", page: 1, limit: 20, ... }
  return apiClient.get('/wsf/servants', { params }).then(res => res.data);
};

export const getServantById = async (userId) => {
  return apiClient.get(`/wsf/servants/${userId}`).then(res => res.data);
};

export const createServant = async (userData) => {
  // userData = { nom_complet, telephone, role, cell_id, ... }
  return apiClient.post('/wsf/servants', userData).then(res => res.data);
};

export const updateServant = async (userId, updates) => {
  return apiClient.put(`/wsf/servants/${userId}`, updates).then(res => res.data);
};

export const deleteServant = async (userId) => {
  return apiClient.delete(`/wsf/servants/${userId}`);
};