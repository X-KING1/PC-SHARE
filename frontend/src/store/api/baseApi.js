// TuneCasa RTK Query - Base API Configuration
// Reference: https://redux-toolkit.js.org/rtk-query/overview
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base API with common configuration
export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api',
        prepareHeaders: (headers, { getState }) => {
            // Get token from auth state
            const token = getState().auth?.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    // Tag types for cache invalidation
    tagTypes: ['Course', 'Quiz', 'User', 'Category', 'Recommendation', 'Payment', 'Comment', 'AdminStats', 'AdminUsers', 'AdminCourses', 'AdminPayments', 'AdminQuizzes', 'AdminForum', 'AdminSessions'],
    // Endpoints will be injected from separate files
    endpoints: () => ({}),
});
