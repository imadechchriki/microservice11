// src/services/professionalService.js
import api from "../api/axiosInstance";

/* ------------------------------ READ ------------------------------ */
export async function fetchProfessionals() {
  const { data } = await api.get("/admin/professionals");
  return data;
}

export async function fetchProfessionalById(id) {
  const { data } = await api.get(`/admin/professionals/${id}`);
  return data;
}

export async function fetchProfileStatus(professionalId) {
  try {
    const { data } = await api.get(`/UserProfile/has-profile/${professionalId}`);
    return data?.hasProfile ?? false;
  } catch (error) {
    return false;
  }
}

/* ----------------------------- CREATE ----------------------------- */
export async function addProfessional(payload) {
  // L'API attend seulement firstName, lastName, email (pas de module)
  const professionalData = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email
  };
  
  const { data } = await api.post("/admin/professionals", professionalData);
  return data; // L'API renvoie directement l'objet professional
}

/* ----------------------------- UPDATE ----------------------------- */
export async function updateProfessional(id, payload) {
  const professionalData = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email
  };
  
  const { data } = await api.put(`/admin/professionals/${id}`, professionalData);
  return data;
}

/* ----------------------------- DELETE ----------------------------- */
export async function deleteProfessional(id) {
  await api.delete(`/admin/professionals/${id}`);
  return id;
}

/* -------------------------- IMPORT EXCEL -------------------------- */
export async function importProfessionalsFromExcel(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post("/admin/professionals/import-excel", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
}