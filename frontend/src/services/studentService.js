// src/services/studentService.js
import api from "../api/axiosInstance";

/* ------------------------------ READ ------------------------------ */
export async function fetchStudents() {
  const { data } = await api.get("/admin/students");
  return data;
}

export async function fetchStudentById(id) {
  const { data } = await api.get(`/admin/students/${id}`);
  return data;
}

export async function fetchProfileStatus(studentId) {
  try {
    const { data } = await api.get(`/UserProfile/has-profile/${studentId}`);
    return data?.hasProfile ?? false;
  } catch (error) {
    return false;
  }
}

/* ----------------------------- CREATE ----------------------------- */
export async function addStudent(payload) {
  // L'API attend firstName, lastName, email, filiere
  const studentData = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    filiere: payload.filiere
  };
  
  const { data } = await api.post("/admin/students", studentData);
  return data; // L'API renvoie directement l'objet student
}

/* ----------------------------- UPDATE ----------------------------- */
export async function updateStudent(id, payload) {
  const studentData = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    filiere: payload.filiere
  };
  
  const { data } = await api.put(`/admin/students/${id}`, studentData);
  return data;
}

/* ----------------------------- DELETE ----------------------------- */
export async function deleteStudent(id) {
  await api.delete(`/admin/students/${id}`);
  return id;
}

/* -------------------------- IMPORT EXCEL -------------------------- */
export async function importStudentsFromExcel(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post("/admin/students/import", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
}