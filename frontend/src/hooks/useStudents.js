// src/hooks/useStudents.js
import { useCallback, useEffect, useState } from "react";
import {
  fetchStudents,
  fetchProfileStatus,
  addStudent,
  updateStudent,
  deleteStudent,
  importStudentsFromExcel,
} from "../services/studentService";
import { toast } from "react-toastify";

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchStudents();

      const statuses = {};
      await Promise.all(
        data.map(async (s) => {
          try {
            statuses[s.id] = await fetchProfileStatus(s.id);
          } catch {
            statuses[s.id] = false;
          }
        })
      );

      setStudents(data);
      setProfiles(statuses);
    } catch (e) {
      console.error("Erreur lors de la récupération des étudiants:", e);
      toast.error("Erreur lors de la récupération des étudiants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const createStudent = async (payload) => {
    try {
      await addStudent(payload);
      await loadStudents(); // Refresh after add
      toast.success("Étudiant ajouté avec succès");
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast.error("Erreur lors de l'ajout de l'étudiant");
    }
  };

  const editStudent = async (id, payload) => {
    try {
      await updateStudent(id, payload);
      await loadStudents(); // Refresh after update
      toast.success("Étudiant mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour de l'étudiant");
    }
  };

  const removeStudent = async (id) => {
    try {
      await deleteStudent(id);
      await loadStudents(); // Refresh after delete
      toast.success("Étudiant supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de l'étudiant");
    }
  };

  const importStudents = async (file) => {
    try {
      setLoading(true);
      const result = await importStudentsFromExcel(file);
      await loadStudents(); // Refresh after import

      const { successCount, errorCount, errors } = result;

      if (successCount > 0) {
        toast.success(`✅ ${successCount} étudiant(s) importé(s) avec succès.`);
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
    students,
    profiles,
    loading,
    createStudent,
    editStudent,
    removeStudent,
    importStudents,
    refreshStudents: loadStudents,
  };
}