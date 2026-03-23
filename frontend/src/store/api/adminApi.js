// Admin API — RTK Query endpoints for admin dashboard
import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Overview stats
        getAdminStats: builder.query({
            query: () => '/admin/stats',
            transformResponse: (res) => res.data,
            providesTags: ['AdminStats'],
        }),

        // Users
        getAdminUsers: builder.query({
            query: ({ page = 1, limit = 50 } = {}) => `/admin/users?page=${page}&limit=${limit}`,
            providesTags: ['AdminUsers'],
        }),
        updateUserRole: builder.mutation({
            query: ({ id, role }) => ({
                url: `/admin/users/${id}/role`,
                method: 'PUT',
                body: { role },
            }),
            invalidatesTags: ['AdminUsers', 'AdminStats'],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/admin/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminUsers', 'AdminStats'],
        }),

        // Courses
        getAdminCourses: builder.query({
            query: ({ page = 1, limit = 50 } = {}) => `/admin/courses?page=${page}&limit=${limit}`,
            providesTags: ['AdminCourses'],
        }),
        deleteAdminCourse: builder.mutation({
            query: (id) => ({
                url: `/admin/courses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminCourses', 'AdminStats'],
        }),

        // Payments
        getAdminPayments: builder.query({
            query: ({ page = 1, limit = 50 } = {}) => `/admin/payments?page=${page}&limit=${limit}`,
            providesTags: ['AdminPayments'],
        }),

        // Quizzes
        getAdminQuizzes: builder.query({
            query: () => '/admin/quizzes',
            transformResponse: (res) => res.data,
            providesTags: ['AdminQuizzes'],
        }),

        // Forum
        getAdminThreads: builder.query({
            query: () => '/admin/forum/threads',
            transformResponse: (res) => res.data,
            providesTags: ['AdminForum'],
        }),
        deleteAdminThread: builder.mutation({
            query: (id) => ({
                url: `/admin/forum/threads/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminForum', 'AdminStats'],
        }),
        deleteAdminReply: builder.mutation({
            query: (id) => ({
                url: `/admin/forum/replies/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminForum'],
        }),

        // Sessions
        getAdminSessions: builder.query({
            query: () => '/admin/sessions',
            transformResponse: (res) => res.data,
            providesTags: ['AdminSessions'],
        }),
        deleteAdminSession: builder.mutation({
            query: (id) => ({
                url: `/admin/sessions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminSessions', 'AdminStats'],
        }),
    }),
});

export const {
    useGetAdminStatsQuery,
    useGetAdminUsersQuery,
    useUpdateUserRoleMutation,
    useDeleteUserMutation,
    useGetAdminCoursesQuery,
    useDeleteAdminCourseMutation,
    useGetAdminPaymentsQuery,
    useGetAdminQuizzesQuery,
    useGetAdminThreadsQuery,
    useDeleteAdminThreadMutation,
    useDeleteAdminReplyMutation,
    useGetAdminSessionsQuery,
    useDeleteAdminSessionMutation,
} = adminApi;
