// Course Controller - Using Course Model
import { Course } from '../models/Course.js';

// Get all courses
export const getAllCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const total = await Course.count();
        const courses = await Course.findAll(offset, limit);

        res.status(200).json({
            message: "Successfully fetched all courses",
            data: courses,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: "Failed to fetch courses", error: error.message });
    }
};

// Get single course
export const fetchSingleCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ message: "Successfully fetched course", data: course });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: "Failed to fetch course", error: error.message });
    }
};

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Course.getCategories();

        res.status(200).json({
            message: "Successfully fetched categories",
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: "Failed to fetch categories", error: error.message });
    }
};

// Get courses by category
export const getCoursesByCategory = async (req, res) => {
    try {
        const courses = await Course.findByCategory(req.params.category);

        res.status(200).json({
            message: `Courses in ${req.params.category}`,
            data: courses
        });
    } catch (error) {
        console.error('Get courses by category error:', error);
        res.status(500).json({ message: "Failed to fetch courses", error: error.message });
    }
};
