import axios from 'axios';

// Same origin in production (Vercel serves the site and /api together); proxied in dev.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 20000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(err);
    }
);

export const errorMessage = (err, fallback = 'Something went wrong') =>
    err?.response?.data?.message || (err?.code === 'ECONNABORTED' ? 'The server took too long. Please try again.' : fallback);

export default api;
