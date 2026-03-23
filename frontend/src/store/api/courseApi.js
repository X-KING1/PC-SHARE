// TuneCasa RTK Query - Course API Endpoints
// Reference: https://redux-toolkit.js.org/rtk-query/usage/code-splitting
import { baseApi } from './baseApi';

// Inject course endpoints into base API
export const courseApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // GET /api/courses - Fetch all courses with pagination
        getCourses: build.query({
            query: ({ page = 1, limit = 20 } = {}) => ({
                url: '/courses',
                params: { page, limit },
            }),
            transformResponse: (response) => ({
                courses: response.data,
                pagination: response.pagination,
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.courses.map(({ course_id }) => ({ type: 'Course', id: course_id })),
                        { type: 'Course', id: 'LIST' },
                    ]
                    : [{ type: 'Course', id: 'LIST' }],
        }),

        // GET /api/courses/:id - Fetch single course
        getCourse: build.query({
            query: (id) => `/courses/${id}`,
            transformResponse: (response) => response.data,
            providesTags: (result, error, id) => [{ type: 'Course', id }],
        }),

        // GET /api/courses/categories - Fetch all categories
        getCategories: build.query({
            query: () => '/courses/categories',
            transformResponse: (response) => response.data,
            providesTags: [{ type: 'Category', id: 'LIST' }],
        }),

        // GET /api/courses/category/:category - Fetch courses by category
        getCoursesByCategory: build.query({
            query: (category) => `/courses/category/${encodeURIComponent(category)}`,
            transformResponse: (response) => response.data,
            providesTags: (result, error, category) => [{ type: 'Course', id: `CAT-${category}` }],
        }),

        // GET /api/recommendations/:courseId - Fetch course recommendations
        getRecommendations: build.query({
            query: (courseId) => `/recommendations/${courseId}`,
            transformResponse: (response) => response.data || [],
            providesTags: (result, error, courseId) => [{ type: 'Recommendation', id: courseId }],
        }),

        // POST /api/rate-course - Rate a course
        rateCourse: build.mutation({
            query: (body) => ({
                url: '/rate-course',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, { course_id }) => [{ type: 'Course', id: course_id }],
        }),

        // GET /api/user-rating/:userId/:courseId - Get user's existing rating
        getUserRating: build.query({
            query: ({ userId, courseId }) => `/user-rating/${userId}/${courseId}`,
            transformResponse: (response) => response.data?.rating || 0,
        }),

        // GET /api/comments/:courseId - Get comments for a course
        getCourseComments: build.query({
            query: (courseId) => `/comments/${courseId}`,
            transformResponse: (response) => response.data || [],
            providesTags: (result, error, courseId) => [{ type: 'Comment', id: courseId }],
        }),

        // POST /api/comments - Add a comment
        addCourseComment: build.mutation({
            query: (body) => ({
                url: '/comments',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, { course_id }) => [{ type: 'Comment', id: course_id }],
        }),

        // POST /api/comments/delete - Delete a comment
        deleteCourseComment: build.mutation({
            query: (body) => ({
                url: '/comments/delete',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, { course_id }) => [{ type: 'Comment', id: course_id }],
        }),
    }),
    overrideExisting: false,
});

// Export auto-generated hooks
export const {
    useGetCoursesQuery,
    useGetCourseQuery,
    useGetCategoriesQuery,
    useGetCoursesByCategoryQuery,
    useGetRecommendationsQuery,
    useRateCourseMutation,
    useGetUserRatingQuery,
    useGetCourseCommentsQuery,
    useAddCourseCommentMutation,
    useDeleteCourseCommentMutation,
} = courseApi;
