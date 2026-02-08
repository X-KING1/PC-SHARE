// Question Model - All question-related database operations
import { getConnection } from '../config/oracle.js';

export const Question = {
    // Find questions by quiz ID
    findByQuizId: async (quizId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT question_id, question_text, option_a, option_b, option_c, option_d, correct_answer 
                 FROM questions WHERE quiz_id = :quizId ORDER BY question_id`,
                { quizId }
            );

            const columns = ['question_id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];
            return result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                obj.points = 10; // Default 10 points per question
                return obj;
            });
        } finally {
            await connection.close();
        }
    },

    // Find question by ID (for getting correct answer)
    findById: async (questionId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                'SELECT correct_answer FROM questions WHERE question_id = :question_id',
                { question_id: questionId }
            );

            if (result.rows.length < 1) return null;
            return { correct_answer: result.rows[0][0], points: 10 };
        } finally {
            await connection.close();
        }
    }
};
