import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const baseApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default baseApi;

// 사용 예시: export const login = (data) => baseApi.post("/login", data);
