// Forum API - RTK Query endpoints with image upload support
import { baseApi } from './baseApi'

export const forumApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // Get all threads
        getThreads: build.query({
            query: () => '/forum/threads',
            transformResponse: (response) => response.data,
            providesTags: ['Forum'],
        }),

        // Get single thread with replies
        getThread: build.query({
            query: (threadId) => `/forum/threads/${threadId}`,
            transformResponse: (response) => response.data,
            providesTags: (result, error, id) => [{ type: 'Forum', id }],
        }),

        // Create new thread (with optional multiple images)
        createThread: build.mutation({
            query: (data) => {
                const formData = new FormData()
                formData.append('title', data.title)
                formData.append('content', data.content)
                formData.append('author', data.author)
                if (data.user_id) formData.append('user_id', data.user_id)
                if (data.images && data.images.length > 0) {
                    data.images.forEach(img => formData.append('images', img))
                }
                return {
                    url: '/forum/threads',
                    method: 'POST',
                    body: formData,
                }
            },
            invalidatesTags: ['Forum'],
        }),

        // Add reply to thread (with optional multiple images)
        addReply: build.mutation({
            query: ({ threadId, ...data }) => {
                const formData = new FormData()
                formData.append('content', data.content)
                formData.append('author', data.author)
                if (data.user_id) formData.append('user_id', data.user_id)
                if (data.images && data.images.length > 0) {
                    data.images.forEach(img => formData.append('images', img))
                }
                return {
                    url: `/forum/threads/${threadId}/reply`,
                    method: 'POST',
                    body: formData,
                }
            },
            invalidatesTags: (result, error, { threadId }) => [{ type: 'Forum', id: threadId }, 'Forum'],
        }),

        // Upvote thread
        upvoteThread: build.mutation({
            query: (threadId) => ({
                url: `/forum/threads/${threadId}/upvote`,
                method: 'POST',
            }),
            invalidatesTags: ['Forum'],
        }),

        // Downvote thread
        downvoteThread: build.mutation({
            query: (threadId) => ({
                url: `/forum/threads/${threadId}/downvote`,
                method: 'POST',
            }),
            invalidatesTags: ['Forum'],
        }),

        // Delete thread
        deleteThread: build.mutation({
            query: (threadId) => ({
                url: `/forum/threads/${threadId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Forum'],
        }),

        // Delete reply
        deleteReply: build.mutation({
            query: ({ threadId, replyId }) => ({
                url: `/forum/threads/${threadId}/reply/${replyId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { threadId }) => [{ type: 'Forum', id: threadId }, 'Forum'],
        }),
    }),
})

export const {
    useGetThreadsQuery,
    useGetThreadQuery,
    useCreateThreadMutation,
    useAddReplyMutation,
    useUpvoteThreadMutation,
    useDownvoteThreadMutation,
    useDeleteThreadMutation,
    useDeleteReplyMutation,
} = forumApi
