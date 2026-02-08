// System Routes - TuneCasa Pattern
import { Router } from 'express';
import errorHandler from '../services/catchAsyncError.js';
import { healthCheck, getStats, rateCourse } from '../controllers/systemController.js';

const router = Router();

router.route('/health').get(errorHandler(healthCheck));
router.route('/stats').get(errorHandler(getStats));
router.route('/rate-course').post(errorHandler(rateCourse));

export default router;
