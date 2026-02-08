// QuizAttempt Model - Quiz attempt database operations
import { getConnection } from '../config/oracle.js';

export const QuizAttempt = {
    // Get next attempt ID
    getNextId: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute('SELECT NVL(MAX(attempt_id), 0) + 1 FROM quiz_attempts');
            return result.rows[0][0];
        } finally {
            await connection.close();
        }
    },

    // Create new quiz attempt
    create: async (userId, quizId) => {
        const connection = await getConnection();
        try {
            const attemptId = await QuizAttempt.getNextId();
            await connection.execute(
                `INSERT INTO quiz_attempts (attempt_id, user_id, quiz_id, started_at) 
                 VALUES (:attempt_id, :user_id, :quiz_id, SYSTIMESTAMP)`,
                { attempt_id: attemptId, user_id: userId, quiz_id: quizId },
                { autoCommit: true }
            );
            return attemptId;
        } finally {
            await connection.close();
        }
    },

    // Complete quiz attempt with score
    complete: async (attemptId, score) => {
        const connection = await getConnection();
        try {
            await connection.execute(
                `UPDATE quiz_attempts SET score = :score, completed_at = SYSTIMESTAMP 
                 WHERE attempt_id = :attemptId`,
                { score, attemptId },
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }
    }
};
