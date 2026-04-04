// User Routes - TuneCasa Pattern
import { Router } from 'express';
import errorHandler from '../services/catchAsyncError.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
    register,
    login,
    logout,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    fetchSingleUser,
    updateProfile,
    uploadProfileImage,
    avatarUpload
} from '../controllers/userController.js';

const router = Router();

// Public routes (no auth required)
router.route('/register').post(errorHandler(register));
router.route('/login').post(errorHandler(login));
router.route('/logout').post(errorHandler(logout));
router.route('/forgot-password').post(errorHandler(forgotPassword));
router.route('/reset-password').post(errorHandler(resetPassword));

// Protected routes (auth required)
router.route('/me').get(requireAuth, errorHandler(getCurrentUser));
router.route('/me').put(requireAuth, errorHandler(updateProfile));
router.route('/me/avatar').post(requireAuth, avatarUpload.single('avatar'), errorHandler(uploadProfileImage));
router.route('/:id').get(errorHandler(fetchSingleUser));

export default router;
