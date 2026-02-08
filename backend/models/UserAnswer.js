// UserAnswer Model - User quiz answer database operations
import { getConnection } from '../config/oracle.js';

export const UserAnswer = {
    // Get next answer ID
    getNextId: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute('SELECT NVL(MAX(answer_id), 0) + 1 FROM user_answers');
            return result.rows[0][0];
        } finally {
            await connection.close();
        }
    },

    // Save user answer
    create: async (data) => {
        const connection = await getConnection();
        try {
            await connection.execute(
                `INSERT INTO user_answers (answer_id, attempt_id, question_id, selected_answer, is_correct, points_earned) 
                 VALUES (:answer_id, :attempt_id, :question_id, :selected_answer, :is_correct, :points_earned)`,
                data,
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }
    },

    // Get total score for an attempt
    getScoreByAttempt: async (attemptId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT SUM(points_earned) as score, COUNT(*) as answered 
                 FROM user_answers WHERE attempt_id = :attemptId`,
                { attemptId }
            );
            return result.rows[0][0] || 0;
        } finally {
            await connection.close();
        }
    }
};
