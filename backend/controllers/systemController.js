// System Controller - Using Models
import { System } from '../models/System.js';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Quiz } from '../models/Quiz.js';
import { Interaction } from '../models/Interaction.js';

// Health check
export const healthCheck = async (req, res) => {
    try {
        const health = await System.healthCheck();

        if (health.status === 'healthy') {
            res.status(200).json({
                message: "Health check passed",
                data: { ...health, timestamp: new Date().toISOString() }
            });
        } else {
            res.status(500).json({
                message: "Health check failed",
                data: health
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Health check failed",
            data: { status: "unhealthy", error: error.message }
        });
    }
};

// Get stats
export const getStats = async (req, res) => {
    try {
        const [totalCourses, totalUsers, totalQuizzes, totalInteractions] = await Promise.all([
            Course.count(),
            User.count(),
            Quiz.count(),
            Interaction.count()
        ]);

        res.status(200).json({
            message: "Successfully fetched stats",
            data: {
                total_courses: totalCourses,
                total_users: totalUsers,
                total_quizzes: totalQuizzes,
                total_interactions: totalInteractions
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: "Failed to fetch stats", error: error.message });
    }
};

// Rate course
export const rateCourse = async (req, res) => {
    const { user_id, course_id, rating } = req.body;

    if (!user_id || !course_id || !rating) {
        return res.status(400).json({ message: "user_id, course_id, and rating are required" });
    }

    try {
        // Check if rating exists
        const existingId = await Interaction.findByUserAndCourse(user_id, course_id);

        if (existingId) {
            // Update existing rating
            await Interaction.updateRating(user_id, course_id, rating);
        } else {
            // Get new interaction_id and create
            const interactionId = await Interaction.getNextId();
            await Interaction.create({
                interaction_id: interactionId,
                user_id,
                course_id,
                rating
            });
        }

        res.status(200).json({
            message: "Rating saved successfully",
            data: { user_id, course_id, rating }
        });
    } catch (error) {
        console.error('Rate course error:', error);
        res.status(500).json({ message: "Failed to save rating", error: error.message });
    }
};

// Get user's rating for a specific course
export const getUserRating = async (req, res) => {
    const { userId, courseId } = req.params;
    try {
        const rating = await Interaction.getUserRating(userId, courseId);
        res.status(200).json({
            message: "Rating fetched",
            data: { rating: rating || 0 }
        });
    } catch (error) {
        console.error('Get user rating error:', error);
        res.status(500).json({ message: "Failed to fetch rating", error: error.message });
    }
};

// Get comments for a course
export const getComments = async (req, res) => {
    const { courseId } = req.params;
    try {
        const comments = await Interaction.getCommentsByCourse(courseId);
        res.status(200).json({
            message: "Comments fetched",
            data: comments
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ message: "Failed to fetch comments", error: error.message });
    }
};

// Add a comment to a course
export const addComment = async (req, res) => {
    const { user_id, course_id, comment_text } = req.body;
    if (!user_id || !course_id || !comment_text) {
        return res.status(400).json({ message: "user_id, course_id, and comment_text are required" });
    }
    try {
        const commentId = await Interaction.addComment(user_id, course_id, comment_text);
        res.status(201).json({
            message: "Comment added",
            data: { comment_id: commentId, user_id, course_id, comment_text }
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: "Failed to add comment", error: error.message });
    }
};

// Delete a comment (only own comments)
export const deleteComment = async (req, res) => {
    const { comment_id, user_id } = req.body;
    if (!comment_id || !user_id) {
        return res.status(400).json({ message: "comment_id and user_id are required" });
    }
    try {
        const deleted = await Interaction.deleteComment(comment_id, user_id);
        if (deleted) {
            res.status(200).json({ message: "Comment deleted" });
        } else {
            res.status(404).json({ message: "Comment not found or not yours" });
        }
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ message: "Failed to delete comment", error: error.message });
    }
};
