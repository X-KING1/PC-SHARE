// LearnHub Config - Application Configuration
// Centralized configuration for the application

// In production: VITE_API_URL is empty → uses relative '/api' (Nginx proxies to backend)
// In development: Falls back to 'http://localhost:5000/api'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const config = {
    // API Configuration
    API_URL: `${API_BASE}/api`,
    API_BASE,

    // App Info
    APP_NAME: 'LearnHub',
    APP_DESCRIPTION: 'AI-Powered E-Learning Platform',

    // Auth Settings
    TOKEN_KEY: 'token',
    USER_KEY: 'user',

    // Pagination Defaults
    DEFAULT_PAGE_SIZE: 20,
    HOME_COURSE_LIMIT: 6,
}

export default config
