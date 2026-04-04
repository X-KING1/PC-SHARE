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
            query: ({ page = 1, limit = 50, search = '' } = {}) => `/admin/users?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
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
            query: ({ page = 1, limit = 50, search = '' } = {}) => `/admin/courses?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
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
        createAdminQuiz: builder.mutation({
            query: (body) => ({
                url: '/admin/quizzes',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AdminQuizzes', 'AdminStats'],
        }),
        getAdminQuizDetails: builder.query({
            query: (id) => `/admin/quizzes/${id}`,
            transformResponse: (res) => res.data,
            providesTags: (result, error, id) => [{ type: 'AdminQuizDetails', id }],
        }),
        updateAdminQuiz: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/admin/quizzes/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['AdminQuizzes', 'AdminQuizDetails'],
        }),
        deleteAdminQuiz: builder.mutation({
            query: (id) => ({
                url: `/admin/quizzes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminQuizzes', 'AdminStats'],
        }),

        // Questions
        addAdminQuestion: builder.mutation({
            query: ({ quizId, ...body }) => ({
                url: `/admin/quizzes/${quizId}/questions`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AdminQuizzes', 'AdminQuizDetails'],
        }),
        updateAdminQuestion: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/admin/quizzes/questions/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['AdminQuizDetails'],
        }),
        deleteAdminQuestion: builder.mutation({
            query: (id) => ({
                url: `/admin/quizzes/questions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminQuizzes', 'AdminQuizDetails'],
        }),

        // Forum
        getAdminThreads: builder.query({
            query: () => '/admin/forum/threads',
            transformResponse: (res) => res.data,
            providesTags: ['AdminForum'],
        }),
        getAdminThreadDetails: builder.query({
            query: (id) => `/admin/forum/threads/${id}`,
            transformResponse: (res) => res.data,
            providesTags: (result, error, id) => [{ type: 'AdminThreadDetails', id }],
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
            invalidatesTags: ['AdminForum', 'AdminThreadDetails'],
        }),
        getAdminForumStats: builder.query({
            query: () => '/admin/forum/stats',
            transformResponse: (res) => res.data,
            providesTags: ['AdminForumStats'],
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
    useCreateAdminQuizMutation,
    useGetAdminQuizDetailsQuery,
    useUpdateAdminQuizMutation,
    useDeleteAdminQuizMutation,
    useAddAdminQuestionMutation,
    useUpdateAdminQuestionMutation,
    useDeleteAdminQuestionMutation,
    useGetAdminThreadsQuery,
    useGetAdminThreadDetailsQuery,
    useDeleteAdminThreadMutation,
    useDeleteAdminReplyMutation,
    useGetAdminForumStatsQuery,
    useGetAdminSessionsQuery,
    useDeleteAdminSessionMutation,
} = adminApi;
