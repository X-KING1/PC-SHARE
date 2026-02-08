// TuneCasa Redux Store Pattern with RTK Query
// Reference: https://redux-toolkit.js.org/rtk-query/overview
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import quizReducer from "./quizSlice";
import authReducer from "./authSlice";
import { baseApi } from "./api/baseApi";

const store = configureStore({
    reducer: {
        // Quiz reducer (still used by Quiz.jsx)
        quiz: quizReducer,
        // Auth reducer
        auth: authReducer,
        // RTK Query API reducer
        [baseApi.reducerPath]: baseApi.reducer,
    },
    // Add RTK Query middleware for caching, invalidation, polling
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

export default store;
