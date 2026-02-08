// TuneCasa Config - Application Configuration
// Centralized configuration for the application

export const config = {
    // API Configuration
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

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
