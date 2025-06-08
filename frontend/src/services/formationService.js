// src/services/formationService.js
import qApi from "../api/questionnaireApi"; // whatever your axios instance is

export async function fetchFilieres() {
  const { data } = await qApi.get('api/formation-cache');
  return data;  // array of { id, code, title, … }
}
