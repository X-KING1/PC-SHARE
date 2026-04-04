// RTK Query - Dashboard API Endpoints
import { baseApi } from './baseApi';

export const dashboardApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // GET /api/dashboard/:userId — All dashboard data
        getDashboardData: build.query({
            query: (userId) => `/dashboard/${userId}`,
            transformResponse: (response) => response.data,
            providesTags: ['Dashboard'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetDashboardDataQuery,
} = dashboardApi;
