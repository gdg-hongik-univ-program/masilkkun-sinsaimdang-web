import axios from "axios";

const baseApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 서버에서 쿠키 사용 시 true
});

// ✅ 요청마다 accessToken만 추가
baseApi.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ refreshToken 자동 재발급 제거 (response interceptor 생략)

// 더 이상 refreshToken 관련 요청 없음!
export default baseApi;
