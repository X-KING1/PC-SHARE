// HTTP API Configuration — Used by Redux thunks (quizSlice, authSlice, etc.)
import axios from 'axios';
import config from '../config';

// Public API (no auth required)
const API = axios.create({
    baseURL: config.API_BASE,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Authenticated API (requires token)
const APIAuthenticated = axios.create({
    baseURL: config.API_BASE,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Auto-attach token to every authenticated request
APIAuthenticated.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export { API, APIAuthenticated };
