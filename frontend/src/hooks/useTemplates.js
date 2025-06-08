/* ------------------------------------------------------------------ */
/*  Hook : useTemplates                                               */
/*  Place : frontend/src/hooks/useTemplates.js                        */
/* ------------------------------------------------------------------ */
import { useState, useCallback } from "react";
import { toast } from "react-toastify";

import {
  /* ── Template endpoints ────────────────────────────────────────── */
  createTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  /* ── Section endpoints ─────────────────────────────────────────── */
  createSection,
  /* getSections,   updateSection, deleteSection,   // dispo si besoin */
  /* ── Question endpoints ────────────────────────────────────────── */
  createQuestion,
  /* getQuestions, updateQuestion, deleteQuestion, */
} from "../services/templateService";

/* ================================================================== */
/*  PUBLIC API                                                        */
/* ================================================================== */
export function useTemplates() {
  /* ---------- state ---------- */
  const [templates, setTemplates] = useState([]);      // ← toujours tableau
  const [loading,   setLoading]   = useState(false);

  /* ---------- helpers ---------- */
  const safeArray = obj =>
    Array.isArray(obj)                ? obj :
    Array.isArray(obj?.data)          ? obj.data :
    Array.isArray(obj?.items)         ? obj.items :
    Array.isArray(obj?.templates)     ? obj.templates :
    [];

  /* ---------- fetch all templates ---------- */
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getTemplates();   // Axios response
      const list = safeArray(res.data);
      setTemplates(list);
    } catch {
      toast.error("Erreur lors du chargement des templates");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- CRUD : template ---------- */
  const addTemplate = async payload => {
    try {
      await createTemplate(payload);
      await loadTemplates();
      toast.success("Template créé");
    } catch {
      toast.error("Impossible de créer le template");
    }
  };

  const editTemplate = async (id, payload) => {
    try {
      await updateTemplate(id, payload);
      await loadTemplates();
      toast.success("Template mis à jour");
    } catch {
      toast.error("Échec de la mise à jour");
    }
  };

  const removeTemplate = async id => {
    try {
      await deleteTemplate(id);
      await loadTemplates();
      toast.success("Template supprimé");
    } catch {
      toast.error("Suppression impossible");
    }
  };

  /* ---------- Section & Question helpers (exemples) ---------- */
  const addSection   = (tplId, payload)                 =>
    createSection(tplId, payload);

  const addQuestion  = (tplId, sectionId, payload)      =>
    createQuestion(tplId, sectionId, payload);

  /* ---------- what the hook exposes ---------- */
  return {
    templates,
    loading,

    /* loaders */
    loadTemplates,

    /* template CRUD */
    addTemplate,
    editTemplate,
    removeTemplate,

    /* extras re-exposed if needed in editors */
    addSection,
    addQuestion,
  };
}
