// src/hooks/useFilieres.js
import { useState, useEffect } from 'react';
import { fetchFilieres } from '../services/formationService';
import { toast } from 'react-toastify';

export function useFilieres() {
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchFilieres();
        setFilieres(list);
      } catch {
        toast.error('Impossible de charger les filières');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { filieres, loading };
}
