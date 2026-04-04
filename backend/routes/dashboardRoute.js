// Dashboard Routes
import { Router } from 'express';
import errorHandler from '../services/catchAsyncError.js';
import { getDashboardData } from '../controllers/dashboardController.js';

const router = Router();

router.route('/:userId').get(errorHandler(getDashboardData));

export default router;
