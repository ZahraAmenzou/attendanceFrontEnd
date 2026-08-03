import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://attandance-smart-backend.vercel.app/api/",
});