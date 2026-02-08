// Interaction Model - User-course interaction database operations
import { getConnection } from '../config/oracle.js';

export const Interaction = {
    // Check if interaction exists for user and course
    findByUserAndCourse: async (userId, courseId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                'SELECT interaction_id FROM user_interactions WHERE user_id = :user_id AND course_id = :course_id',
                { user_id: userId, course_id: courseId }
            );
            return result.rows.length > 0 ? result.rows[0][0] : null;
        } finally {
            await connection.close();
        }
    },

    // Get next interaction ID
    getNextId: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute('SELECT NVL(MAX(interaction_id), 0) + 1 FROM user_interactions');
            return result.rows[0][0];
        } finally {
            await connection.close();
        }
    },

    // Create new interaction (rating)
    create: async (data) => {
        const connection = await getConnection();
        try {
            await connection.execute(
                `INSERT INTO user_interactions (interaction_id, user_id, course_id, rating, timestamp) 
                 VALUES (:interaction_id, :user_id, :course_id, :rating, SYSTIMESTAMP)`,
                data,
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }
    },

    // Update existing rating
    updateRating: async (userId, courseId, rating) => {
        const connection = await getConnection();
        try {
            await connection.execute(
                'UPDATE user_interactions SET rating = :rating, timestamp = SYSTIMESTAMP WHERE user_id = :user_id AND course_id = :course_id',
                { rating, user_id: userId, course_id: courseId },
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }
    },

    // Count total interactions
    count: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute('SELECT COUNT(*) FROM user_interactions');
            return result.rows[0][0];
        } finally {
            await connection.close();
        }
    }
};
