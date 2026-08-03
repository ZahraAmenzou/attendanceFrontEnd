import { axiosInstance } from "../api/axios";

export const signup = (data) => {
  return axiosInstance.post("/auth/signup", data);
};

export const login = (data) => {
  return axiosInstance.post("/auth/login", data);
};