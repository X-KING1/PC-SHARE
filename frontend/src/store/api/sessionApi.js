// RTK Query - Live Session API Endpoints
import { baseApi } from './baseApi';

export const sessionApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // GET sessions by mentor
        getMentorSessions: build.query({
            query: (userId) => `/sessions/mentor/${userId}`,
            transformResponse: (response) => response.data,
            providesTags: ['Session'],
        }),

        // GET sessions for a course
        getCourseSessions: build.query({
            query: (courseId) => `/sessions/course/${courseId}`,
            transformResponse: (response) => response.data,
            providesTags: (result, error, courseId) => [{ type: 'Session', id: courseId }],
        }),

        // POST create session
        createSession: build.mutation({
            query: (data) => ({
                url: '/sessions',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Session'],
        }),

        // PUT book session
        bookSession: build.mutation({
            query: ({ id, student_id, student_name }) => ({
                url: `/sessions/${id}/book`,
                method: 'PUT',
                body: { student_id, student_name },
            }),
            invalidatesTags: ['Session'],
        }),

        // PUT complete session
        completeSession: build.mutation({
            query: (id) => ({
                url: `/sessions/${id}/complete`,
                method: 'PUT',
            }),
            invalidatesTags: ['Session'],
        }),

        // DELETE session
        deleteSession: build.mutation({
            query: (id) => ({
                url: `/sessions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Session'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetMentorSessionsQuery,
    useGetCourseSessionsQuery,
    useCreateSessionMutation,
    useBookSessionMutation,
    useCompleteSessionMutation,
    useDeleteSessionMutation,
} = sessionApi;
