// Admin Routes — Protected by requireAdmin middleware
import { Router } from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import errorHandler from '../services/catchAsyncError.js';
import {
    getAdminStats,
    getAllUsers, updateUserRole, deleteUser,
    getAllCourses, deleteCourse,
    getAllPayments,
    getAllQuizzes,
    getAllThreads, deleteThread, deleteReply,
    getAllSessions, deleteSession
} from '../controllers/adminController.js';

const router = Router();

// All routes require admin auth
router.use(requireAdmin);

// Overview
router.get('/stats', errorHandler(getAdminStats));

// Users
router.get('/users', errorHandler(getAllUsers));
router.put('/users/:id/role', errorHandler(updateUserRole));
router.delete('/users/:id', errorHandler(deleteUser));

// Courses
router.get('/courses', errorHandler(getAllCourses));
router.delete('/courses/:id', errorHandler(deleteCourse));

// Payments
router.get('/payments', errorHandler(getAllPayments));

// Quizzes
router.get('/quizzes', errorHandler(getAllQuizzes));

// Forum
router.get('/forum/threads', errorHandler(getAllThreads));
router.delete('/forum/threads/:id', errorHandler(deleteThread));
router.delete('/forum/replies/:id', errorHandler(deleteReply));

// Live Sessions
router.get('/sessions', errorHandler(getAllSessions));
router.delete('/sessions/:id', errorHandler(deleteSession));

export default router;
