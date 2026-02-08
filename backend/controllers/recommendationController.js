// Recommendation Controller - Using Course Model
import { Course } from '../models/Course.js';

// Get recommendations for a course
export const getRecommendations = async (req, res) => {
    const { courseId } = req.params;

    try {
        // Get current course info
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Get similar courses (same category, different course)
        const similarCourses = await Course.findSimilar(course.category, courseId, 10);

        // Get popular courses (most interactions)
        const popularCourses = await Course.findPopular(courseId, 10);

        res.status(200).json({
            message: "Successfully fetched recommendations",
            data: {
                similar_courses: similarCourses,
                recommended_for_you: popularCourses
            }
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ message: "Failed to fetch recommendations", error: error.message });
    }
};
