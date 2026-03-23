// System Routes - TuneCasa Pattern
import { Router } from 'express';
import errorHandler from '../services/catchAsyncError.js';
import { healthCheck, getStats, rateCourse, getUserRating, getComments, addComment, deleteComment } from '../controllers/systemController.js';

const router = Router();

router.route('/health').get(errorHandler(healthCheck));
router.route('/stats').get(errorHandler(getStats));
router.route('/rate-course').post(errorHandler(rateCourse));
router.route('/user-rating/:userId/:courseId').get(errorHandler(getUserRating));
// Comments - delete route MUST come before :courseId to avoid conflict
router.route('/comments/delete').post(errorHandler(deleteComment));
router.route('/comments').post(errorHandler(addComment));
router.route('/comments/:courseId').get(errorHandler(getComments));

export default router;
