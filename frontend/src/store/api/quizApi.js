// TuneCasa RTK Query - Quiz API Endpoints
import { baseApi } from './baseApi';

// Inject quiz endpoints into base API
export const quizApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // GET /api/quizzes/course/:courseId - Fetch quizzes for a course
        getQuizzes: build.query({
            query: (courseId) => `/quizzes/course/${courseId}`,
            transformResponse: (response) => response.data,
            providesTags: (result, error, courseId) => [{ type: 'Quiz', id: courseId }],
        }),

        // POST /api/quizzes/submit - Submit quiz answers
        submitQuiz: build.mutation({
            query: (quizData) => ({
                url: '/quizzes/submit',
                method: 'POST',
                body: quizData,
            }),
            transformResponse: (response) => response.data,
            // Invalidate quiz cache after submission
            invalidatesTags: (result, error, { course_id }) => [{ type: 'Quiz', id: course_id }],
        }),

        // GET /api/quizzes/completed/:userId - Get completed quiz IDs
        getCompletedQuizzes: build.query({
            query: (userId) => `/quizzes/completed/${userId}`,
            transformResponse: (response) => response.data,
            providesTags: ['CompletedQuizzes'],
        }),
    }),
    overrideExisting: false,
});

// Export auto-generated hooks
export const {
    useGetQuizzesQuery,
    useSubmitQuizMutation,
    useGetCompletedQuizzesQuery,
} = quizApi;
