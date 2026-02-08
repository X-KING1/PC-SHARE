// Course Routes - TuneCasa Pattern
import { Router } from 'express';
import errorHandler from '../services/catchAsyncError.js';
import { getAllCourses, fetchSingleCourse, getCategories, getCoursesByCategory } from '../controllers/courseController.js';

const router = Router();

router.route('/').get(errorHandler(getAllCourses));
router.route('/categories').get(errorHandler(getCategories));
router.route('/category/:category').get(errorHandler(getCoursesByCategory));
router.route('/:id').get(errorHandler(fetchSingleCourse));

export default router;
