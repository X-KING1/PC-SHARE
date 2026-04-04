// Auth Slice - LearnHub Redux State for Authentication
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { STATUS } from '../globals/Status';
import config from '../config';

const API_URL = `${config.API_BASE}/api/users`;

// Get stored auth from localStorage
const getStoredAuth = () => {
    try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return {
            token: token || null,
            user: user ? JSON.parse(user) : null,
            isAuthenticated: !!token
        };
    } catch {
        return { token: null, user: null, isAuthenticated: false };
    }
};

// ==================== ASYNC THUNKS ====================

// Register
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            // Store token and user
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

// Login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            // Store token and user
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// Logout
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
    }
);

// Get current user (verify token)
export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token || localStorage.getItem('token');
            if (!token) {
                return rejectWithValue('No token');
            }
            const response = await axios.get(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return rejectWithValue(error.response?.data?.message || 'Session expired');
        }
    }
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
        }
    }
);

// Reset Password
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ email, otp, newPassword }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Password reset failed');
        }
    }
);

// Update Profile
export const updateUserProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token || localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/me`, profileData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.setItem('user', JSON.stringify(response.data.data));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Profile update failed');
        }
    }
);

// Upload Avatar
export const uploadUserAvatar = createAsyncThunk(
    'auth/uploadAvatar',
    async (formData, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token || localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/me/avatar`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            localStorage.setItem('user', JSON.stringify(response.data.data));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Avatar upload failed');
        }
    }
);

// ==================== SLICE ====================

const initialState = {
    ...getStoredAuth(),
    status: STATUS.IDLE,
    error: null,
    message: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearMessage: (state) => {
            state.message = null;
        },
        resetStatus: (state) => {
            state.status = STATUS.IDLE;
            state.error = null;
            state.message = null;
        }
    },
    extraReducers: (builder) => {
        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.status = STATUS.LOADING;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = STATUS.SUCCESS;
                state.token = action.payload.token;
                state.user = action.payload.data;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = STATUS.ERROR;
                state.error = action.payload;
            });

        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = STATUS.LOADING;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = STATUS.SUCCESS;
                state.token = action.payload.token;
                state.user = action.payload.data;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = STATUS.ERROR;
                state.error = action.payload;
            });

        // Logout
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.token = null;
                state.user = null;
                state.isAuthenticated = false;
                state.status = STATUS.IDLE;
            });

        // Fetch Current User
        builder
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload.data;
                state.isAuthenticated = true;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.token = null;
                state.user = null;
                state.isAuthenticated = false;
            });

        // Forgot Password
        builder
            .addCase(forgotPassword.pending, (state) => {
                state.status = STATUS.LOADING;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.status = STATUS.SUCCESS;
                state.message = action.payload.message;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.status = STATUS.ERROR;
                state.error = action.payload;
            });

        // Reset Password
        builder
            .addCase(resetPassword.pending, (state) => {
                state.status = STATUS.LOADING;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.status = STATUS.SUCCESS;
                state.message = action.payload.message;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.status = STATUS.ERROR;
                state.error = action.payload;
            });

        // Update Profile
        builder
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.user = action.payload.data;
            });

        // Upload Avatar
        builder
            .addCase(uploadUserAvatar.fulfilled, (state, action) => {
                state.user = action.payload.data;
            });
    }
});

export const { clearError, clearMessage, resetStatus } = authSlice.actions;
export default authSlice.reducer;
