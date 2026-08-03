import { axiosInstance } from "../api/axios";

export const getDashboardStats = (token) => {
  return axiosInstance.get("/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};