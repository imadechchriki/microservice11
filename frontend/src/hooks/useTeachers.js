// src/hooks/useTeachers.js
import { useCallback, useEffect, useState } from "react";
import {
  fetchTeachers,
  fetchProfileStatus,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  importTeachersFromExcel,
} from "../services/teacherService";
import { toast } from "react-toastify";

export function useTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTeachers();

      const statuses = {};
      await Promise.all(
        data.map(async (t) => {
          try {
            statuses[t.id] = await fetchProfileStatus(t.id);
          } catch {
            statuses[t.id] = false;
          }
        })
      );

      setTeachers(data);
      setProfiles(statuses);
    } catch (e) {
      console.error("Erreur lors de la récupération des enseignants:", e);
      toast.error("Erreur lors de la récupération des enseignants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const createTeacher = async (payload) => {
    try {
      await addTeacher(payload);
      await loadTeachers(); // Refresh after add
      toast.success("Enseignant ajouté avec succès");
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast.error("Erreur lors de l'ajout de l'enseignant");
    }
  };

  const editTeacher = async (id, payload) => {
    try {
      await updateTeacher(id, payload);
      await loadTeachers(); // Refresh after update
      toast.success("Enseignant mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour de l'enseignant");
    }
  };

  const removeTeacher = async (id) => {
    try {
      await deleteTeacher(id);
      await loadTeachers(); // Refresh after delete
      toast.success("Enseignant supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de l'enseignant");
    }
  };

const importTeachers = async (file) => {
  try {
    setLoading(true);
    const result = await importTeachersFromExcel(file);
    await loadTeachers(); // Refresh after import

    const { successCount, errorCount, errors } = result;

    if (successCount > 0) {
      toast.success(`✅ ${successCount} enseignant(s) importé(s) avec succès.`);
    }

    if (errorCount > 0 && Array.isArray(errors)) {
      // Afficher les erreurs individuellement avec toast.warning
      errors.forEach((err) => toast.warning(`⚠️ ${err}`));
    }

    return result;
  } catch (error) {
    console.error("Erreur lors de l'import:", error);
    toast.error("❌ Erreur lors de l'import du fichier Excel");
    throw error;
  } finally {
    setLoading(false);
  }
};


  return {
    teachers,
    profiles,
    loading,
    createTeacher,
    editTeacher,
    removeTeacher,
    importTeachers,
    refreshTeachers: loadTeachers,
  };
}
