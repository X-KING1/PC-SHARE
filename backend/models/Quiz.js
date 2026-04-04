// Quiz Model - All quiz-related database operations
import { getConnection } from '../config/oracle.js';
import oracledb from 'oracledb';

export const Quiz = {
    // Find quizzes by course ID
    findByCourseId: async (courseId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT * FROM quizzes WHERE course_id = :courseId ORDER BY quiz_id`,
                { courseId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT } // OUT_FORMAT_OBJECT
            );

            return result.rows.map(row => ({
                quiz_id: row.QUIZ_ID,
                title: row.TITLE,
                description: row.DESCRIPTION,
                passing_score: row.PASSING_SCORE,
                time_limit: row.TIME_LIMIT_MINUTES || 30
            }));
        } finally {
            await connection.close();
        }
    },

    findById: async (id) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT * FROM quizzes WHERE quiz_id = :id`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (result.rows.length < 1) return null;

            const row = result.rows[0];
            return {
                quiz_id: row.QUIZ_ID,
                course_id: row.COURSE_ID,
                title: row.TITLE,
                description: row.DESCRIPTION,
                passing_score: row.PASSING_SCORE,
                time_limit: row.TIME_LIMIT_MINUTES || 30
            };
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
