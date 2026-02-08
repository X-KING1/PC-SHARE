// Recommendation Routes - TuneCasa Pattern
import { Router } from 'express';
import errorHandler from '../services/catchAsyncError.js';
import { getRecommendations } from '../controllers/recommendationController.js';

const router = Router();

router.route('/:courseId').get(errorHandler(getRecommendations));

export default router;
