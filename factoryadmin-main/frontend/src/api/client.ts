import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const isLocal = /localhost|127\.0\.0\.1/.test(API_URL);
console.log(`[API] Connected to: ${API_URL} (${isLocal ? 'LOCAL' : 'BACKEND URL'})`);

export { API_URL };

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.dispatchEvent(new Event('admin-unauthorized'));
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
