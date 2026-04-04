// Admin Routes — Protected by requireAdmin middleware
import { Router } from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import errorHandler from '../services/catchAsyncError.js';
import {
    getAdminStats,
    getAllUsers, updateUserRole, deleteUser,
    getAllCourses, deleteCourse,
    getAllPayments,
    getAllQuizzes, createQuiz, getQuizDetails, updateQuiz, deleteQuiz,
    addQuestion, updateQuestion, deleteQuestion,
    getAllThreads, deleteThread, deleteReply, getThreadDetails, getForumStats,
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
router.post('/quizzes', errorHandler(createQuiz));
router.get('/quizzes/:id', errorHandler(getQuizDetails));
router.put('/quizzes/:id', errorHandler(updateQuiz));
router.delete('/quizzes/:id', errorHandler(deleteQuiz));

// Questions
router.post('/quizzes/:id/questions', errorHandler(addQuestion));
router.put('/quizzes/questions/:id', errorHandler(updateQuestion));
router.delete('/quizzes/questions/:id', errorHandler(deleteQuestion));

// Forum
router.get('/forum/threads', errorHandler(getAllThreads));
router.get('/forum/threads/:id', errorHandler(getThreadDetails));
router.delete('/forum/threads/:id', errorHandler(deleteThread));
router.delete('/forum/replies/:id', errorHandler(deleteReply));
router.get('/forum/stats', errorHandler(getForumStats));

// Live Sessions
router.get('/sessions', errorHandler(getAllSessions));
router.delete('/sessions/:id', errorHandler(deleteSession));

export default router;

