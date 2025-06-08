// src/hooks/useProfessionals.js
import { useCallback, useEffect, useState } from "react";
import {
  fetchProfessionals,
  fetchProfileStatus,
  addProfessional,
  updateProfessional,
  deleteProfessional,
  importProfessionalsFromExcel,
} from "../services/professionalService";
import { toast } from "react-toastify";

export function useProfessionals() {
  const [professionals, setProfessionals] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  const loadProfessionals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProfessionals();

      const statuses = {};
      await Promise.all(
        data.map(async (p) => {
          try {
            statuses[p.id] = await fetchProfileStatus(p.id);
          } catch {
            statuses[p.id] = false;
          }
        })
      );

      setProfessionals(data);
      setProfiles(statuses);
    } catch (e) {
      console.error("Erreur lors de la récupération des professionnels:", e);
      toast.error("Erreur lors de la récupération des professionnels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfessionals();
  }, [loadProfessionals]);

  const createProfessional = async (payload) => {
    try {
      await addProfessional(payload);
      await loadProfessionals(); // Refresh after add
      toast.success("Professionnel ajouté avec succès");
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast.error("Erreur lors de l'ajout du professionnel");
    }
  };

  const editProfessional = async (id, payload) => {
    try {
      await updateProfessional(id, payload);
      await loadProfessionals(); // Refresh after update
      toast.success("Professionnel mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour du professionnel");
    }
  };

  const removeProfessional = async (id) => {
    try {
      await deleteProfessional(id);
      await loadProfessionals(); // Refresh after delete
      toast.success("Professionnel supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du professionnel");
    }
  };

  const importProfessionals = async (file) => {
    try {
      setLoading(true);
      const result = await importProfessionalsFromExcel(file);
      await loadProfessionals(); // Refresh after import

      const { successCount, errorCount, errors } = result;

      if (successCount > 0) {
        toast.success(`✅ ${successCount} professionnel(s) importé(s) avec succès.`);
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
    professionals,
    profiles,
    loading,
    createProfessional,
    editProfessional,
    removeProfessional,
    importProfessionals,
    refreshProfessionals: loadProfessionals,
  };
}