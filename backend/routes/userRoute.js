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
    fetchSingleUser
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
router.route('/:id').get(errorHandler(fetchSingleUser));

export default router;
