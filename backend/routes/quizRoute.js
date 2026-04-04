// Quiz Routes - TuneCasa Pattern
import { Router } from 'express';
import errorHandler from '../services/catchAsyncError.js';
import { getCourseQuizzes, fetchSingleQuiz, startQuiz, submitAnswer, completeQuiz, getUserCompletedQuizzes } from '../controllers/quizController.js';

const router = Router();

router.route('/course/:courseId').get(errorHandler(getCourseQuizzes));
router.route('/completed/:userId').get(errorHandler(getUserCompletedQuizzes));
router.route('/:id').get(errorHandler(fetchSingleQuiz));
router.route('/:id/start').post(errorHandler(startQuiz));
router.route('/attempt/:attemptId/answer').post(errorHandler(submitAnswer));
router.route('/attempt/:attemptId/complete').post(errorHandler(completeQuiz));

export default router;
