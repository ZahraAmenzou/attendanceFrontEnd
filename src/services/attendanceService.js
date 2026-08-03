import { axiosInstance } from "../api/axios";

export const markAttendance = (data, token) => {
  return axiosInstance.post("/attendance", data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getAttendance = (token) => {
  return axiosInstance.get("/attendance", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};