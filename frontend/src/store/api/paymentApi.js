// TuneCasa RTK Query - Payment API Endpoints
// Reference: INTERNATION PAYMET project
import { baseApi } from './baseApi';

// Inject payment endpoints into base API
export const paymentApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // GET /api/payment/stripe/config - Get Stripe publishable key
        getStripeConfig: build.query({
            query: () => '/payment/stripe/config',
            transformResponse: (response) => response.data,
        }),

        // POST /api/payment/stripe/create-intent - Create Stripe payment intent
        createStripeIntent: build.mutation({
            query: (body) => ({
                url: '/payment/stripe/create-intent',
                method: 'POST',
                body,
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: ['Payment'],
        }),

        // GET /api/payment/stripe/status/:sessionId - Get checkout session status
        getStripeStatus: build.query({
            query: (sessionId) => `/payment/stripe/status/${sessionId}`,
            transformResponse: (response) => response.data,
        }),

        // POST /api/payment/khalti/initiate - Initiate Khalti payment
        initiateKhaltiPayment: build.mutation({
            query: (body) => ({
                url: '/payment/khalti/initiate',
                method: 'POST',
                body,
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: ['Payment'],
        }),

        // POST /api/payment/khalti/verify - Verify Khalti payment
        verifyKhaltiPayment: build.mutation({
            query: (body) => ({
                url: '/payment/khalti/verify',
                method: 'POST',
                body,
            }),
            transformResponse: (response) => response.data,
        }),

        // GET /api/payment/user/:userId - Get user's purchases
        getUserPayments: build.query({
            query: (userId) => `/payment/user/${userId}`,
            transformResponse: (response) => response.data,
            providesTags: ['Payment'],
        }),

        // GET /api/payment/check/:userId/:courseId - Check if purchased
        checkPurchase: build.query({
            query: ({ userId, courseId }) => `/payment/check/${userId}/${courseId}`,
            transformResponse: (response) => response.data,
            providesTags: (result, error, { courseId }) => [{ type: 'Payment', id: courseId }],
        }),
    }),
    overrideExisting: false,
});

// Export auto-generated hooks
export const {
    useGetStripeConfigQuery,
    useCreateStripeIntentMutation,
    useGetStripeStatusQuery,
    useInitiateKhaltiPaymentMutation,
    useVerifyKhaltiPaymentMutation,
    useGetUserPaymentsQuery,
    useCheckPurchaseQuery,
} = paymentApi;
