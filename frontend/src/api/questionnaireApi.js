import axios from "axios";
import Cookies from "js-cookie";

const qApi = axios.create({
  // VITE_QUESTIONNAIRE_API_URL must be set in .env
  baseURL: import.meta.env.VITE_Question_URL
});

qApi.interceptors.request.use(cfg => {
  const tk = Cookies.get("accessToken");
  if (tk) cfg.headers.Authorization = `Bearer ${tk}`;
  return cfg;
});

export default qApi;
