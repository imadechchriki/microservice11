// src/services/templateService.js
import qApi from "../api/questionnaireApi";

/* ────────────────  TEMPLATES  ──────────────── */
export const createTemplate = data =>
  qApi.post("/api/template/create", data);

export const getTemplates = () =>
  qApi.get("/api/template/all");

export const updateTemplate = (id, data) =>
  qApi.put(`/api/template/update/${id}`, data);

export const deleteTemplate = id =>
  qApi.delete(`/api/template/delete/${id}`);

/* ────────────────  SECTIONS  ──────────────── */
export const createSection = (templateId, data) =>
  qApi.post(`/api/template/${templateId}/sections`, data);

export const getSections = templateId =>
  qApi.get(`/api/template/${templateId}/sections`);

export const updateSection = (templateId, id, data) =>
  qApi.put(`/api/template/${templateId}/sections/${id}`, data);

export const deleteSection = (templateId, id) =>
  qApi.delete(`/api/template/${templateId}/sections/${id}`);

/* ────────────────  QUESTIONS  ──────────────── */
export const createQuestion = (templateId, sectionId, data) =>
  qApi.post(
    `/api/template/${templateId}/section/${sectionId}/question/create`,
    data
  );

export const getQuestions = (templateId, sectionId) =>
  qApi.get(
    `/api/template/${templateId}/section/${sectionId}/questions`
  );

export const updateQuestion = (templateId, sectionId, id, data) =>
  qApi.put(
    `/api/template/${templateId}/section/${sectionId}/question/${id}/update`,
    data
  );

export const deleteQuestion = (templateId, sectionId, id) =>
  qApi.delete(
    `/api/template/${templateId}/section/${sectionId}/question/${id}/delete`
  );
