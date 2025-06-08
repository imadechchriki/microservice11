// src/services/teacherService.js
import api from "../api/axiosInstance";

/* ------------------------------ READ ------------------------------ */
export async function fetchTeachers() {
  const { data } = await api.get("/admin/teachers");
  return data;
}

export async function fetchTeacherById(id) {
  const { data } = await api.get(`/admin/teachers/${id}`);
  return data;
}

export async function fetchProfileStatus(teacherId) {
  try {
    const { data } = await api.get(`/UserProfile/has-profile/${teacherId}`);
    return data?.hasProfile ?? false;
  } catch (error) {
    return false;
  }
}

/* ----------------------------- CREATE ----------------------------- */
export async function addTeacher(payload) {
  // L'API attend seulement firstName, lastName, email (pas de module)
  const teacherData = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email
  };
  
  const { data } = await api.post("/admin/teachers", teacherData);
  return data; // L'API renvoie directement l'objet teacher
}

/* ----------------------------- UPDATE ----------------------------- */
export async function updateTeacher(id, payload) {
  const teacherData = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email
  };
  
  const { data } = await api.put(`/admin/teachers/${id}`, teacherData);
  return data;
}

/* ----------------------------- DELETE ----------------------------- */
export async function deleteTeacher(id) {
  await api.delete(`/admin/teachers/${id}`);
  return id;
}

/* -------------------------- IMPORT EXCEL -------------------------- */
export async function importTeachersFromExcel(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post("/admin/teachers/import-excel", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
}