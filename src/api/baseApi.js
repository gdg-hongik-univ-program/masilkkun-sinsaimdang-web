import axios from "axios";

const baseApi = axios.create({
  baseURL: "/api", // 백엔드 주소 받아야해!!!!!
  withCredentials: true,
});

export default baseApi;
