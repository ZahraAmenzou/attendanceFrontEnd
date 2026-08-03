import { axiosInstance } from "../api/axios";

export const getStudents = (token) => {
  return axiosInstance.get("/students", {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const createStudent = (data, token) => {
  return axiosInstance.post("/students", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};