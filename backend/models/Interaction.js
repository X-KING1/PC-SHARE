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
                `INSERT INTO user_interactions (interaction_id, user_id, course_id, rating) 
                 VALUES (:interaction_id, :user_id, :course_id, :rating)`,
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
                'UPDATE user_interactions SET rating = :rating WHERE user_id = :user_id AND course_id = :course_id',
                { rating, user_id: userId, course_id: courseId },
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }
    },

    // Get user's rating for a course
    getUserRating: async (userId, courseId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                'SELECT rating FROM user_interactions WHERE user_id = :user_id AND course_id = :course_id',
                { user_id: userId, course_id: courseId }
            );
            return result.rows.length > 0 ? result.rows[0][0] : null;
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
    },

    // ─── Course Comments ───────────────────────────────
    initCommentsTable: async () => {
        const connection = await getConnection();
        try {
            await connection.execute(`
                DECLARE
                    table_exists NUMBER;
                BEGIN
                    SELECT COUNT(*) INTO table_exists FROM user_tables WHERE table_name = 'COURSE_COMMENTS';
                    IF table_exists = 0 THEN
                        EXECUTE IMMEDIATE '
                            CREATE TABLE course_comments (
                                comment_id NUMBER PRIMARY KEY,
                                user_id NUMBER NOT NULL,
                                course_id NUMBER NOT NULL,
                                comment_text VARCHAR2(2000) NOT NULL,
                                created_at TIMESTAMP DEFAULT SYSTIMESTAMP
                            )
                        ';
                    END IF;
                END;
            `, [], { autoCommit: true });
        } finally {
            await connection.close();
        }
    },

    addComment: async (userId, courseId, commentText) => {
        const connection = await getConnection();
        try {
            const idResult = await connection.execute('SELECT NVL(MAX(comment_id), 0) + 1 FROM course_comments');
            const commentId = idResult.rows[0][0];
            await connection.execute(
                `INSERT INTO course_comments (comment_id, user_id, course_id, comment_text, created_at)
                 VALUES (:comment_id, :user_id, :course_id, :comment_text, SYSTIMESTAMP)`,
                { comment_id: commentId, user_id: userId, course_id: courseId, comment_text: commentText },
                { autoCommit: true }
            );
            return commentId;
        } finally {
            await connection.close();
        }
    },

    getCommentsByCourse: async (courseId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT c.comment_id, c.user_id, c.comment_text, c.created_at, u.username
                 FROM course_comments c
                 LEFT JOIN user_profiles u ON c.user_id = u.user_id
                 WHERE c.course_id = :course_id
                 ORDER BY c.created_at DESC
                 FETCH FIRST 50 ROWS ONLY`,
                { course_id: courseId }
            );
            return result.rows.map(row => ({
                comment_id: row[0],
                user_id: row[1],
                text: row[2],
                created_at: row[3],
                name: row[4] || 'User'
            }));
        } finally {
            await connection.close();
        }
    },

    deleteComment: async (commentId, userId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                'DELETE FROM course_comments WHERE comment_id = :comment_id AND user_id = :user_id',
                { comment_id: commentId, user_id: userId },
                { autoCommit: true }
            );
            return result.rowsAffected > 0;
        } finally {
            await connection.close();
        }
    }
};
