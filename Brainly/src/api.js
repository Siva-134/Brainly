import axios from 'axios';

const isProduction = import.meta.env.PROD;
export const API_URL = isProduction 
    ? "https://brainly-p75h.onrender.com/api/v1" 
    : "http://localhost:3000/api/v1";
console.log("Initialize API client:", API_URL);

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
