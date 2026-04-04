// TuneCasa Constants - Application Constants
// Centralized constants to avoid magic strings

// Route paths
export const ROUTES = {
    HOME: '/',
    COURSES: '/courses',
    COURSE_DETAIL: '/course/:id',
    QUIZ: '/quiz/:id',
    CERTIFICATE: '/certificate/:id',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    AUTH_CALLBACK: '/auth-callback',
}

// API Endpoints
export const ENDPOINTS = {
    COURSES: '/courses',
    QUIZZES: '/quizzes',
    USERS: '/users',
    AUTH: '/auth',
    RECOMMENDATIONS: '/recommendations',
}

// Quiz statuses
export const QUIZ_STATUS = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
}

// Course levels
export const COURSE_LEVELS = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
}

export default {
    ROUTES,
    ENDPOINTS,
    QUIZ_STATUS,
    COURSE_LEVELS,
}
