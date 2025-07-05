import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8800";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Only log for POST/PUT/DELETE requests to reduce spam
    if (config.method !== 'get') {
      console.log("axios.js: Request interceptor - URL:", config.url, "Method:", config.method);
      console.log("axios.js: Request data:", config.data);
    }
    
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (config.method !== 'get') {
          console.log("axios.js: Added Authorization header");
        }
      } else {
        console.log("axios.js: No token found in userInfo");
      }
    } else {
      console.log("axios.js: No userInfo found in localStorage");
    }
    return config;
  },
  (error) => {
    console.log("axios.js: Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Only log for POST/PUT/DELETE responses to reduce spam
    if (response.config.method !== 'get') {
      console.log("axios.js: Response interceptor - Status:", response.status, "URL:", response.config.url);
      console.log("axios.js: Response data:", response.data);
    }
    return response;
  },
  (error) => {
    console.log("axios.js: Response interceptor error - Status:", error.response?.status, "URL:", error.config?.url);
    console.log("axios.js: Error response data:", error.response?.data);
    
    if (error.response?.status === 401) {
      console.log("axios.js: 401 error - redirecting to login");
      localStorage.removeItem("userInfo");
      window.location.href = "/log-in";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 