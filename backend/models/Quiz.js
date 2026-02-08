// Quiz Model - All quiz-related database operations
import { getConnection } from '../config/oracle.js';

export const Quiz = {
    // Find quizzes by course ID
    findByCourseId: async (courseId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT quiz_id, title, description, passing_score, time_limit_minutes 
                 FROM quizzes WHERE course_id = :courseId ORDER BY quiz_id`,
                { courseId }
            );

            const columns = ['quiz_id', 'title', 'description', 'passing_score', 'time_limit'];
            return result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });
        } finally {
            await connection.close();
        }
    },

    // Find single quiz by ID
    findById: async (id) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT quiz_id, course_id, title, description, passing_score, time_limit_minutes 
                 FROM quizzes WHERE quiz_id = :id`,
                { id }
            );

            if (result.rows.length < 1) return null;

            const columns = ['quiz_id', 'course_id', 'title', 'description', 'passing_score', 'time_limit'];
            const quiz = {};
            columns.forEach((col, i) => quiz[col] = result.rows[0][i]);
            return quiz;
        } finally {
            await connection.close();
        }
    },

    // Count total quizzes
    count: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute('SELECT COUNT(*) FROM quizzes');
            return result.rows[0][0];
        } finally {
            await connection.close();
        }
    }
};
