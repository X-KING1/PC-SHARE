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
} = courseApi;
