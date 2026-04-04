// Quiz Controller - Using Quiz, Question, QuizAttempt, UserAnswer Models
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { UserAnswer } from '../models/UserAnswer.js';
import { getConnection } from '../config/oracle.js';

// Get quizzes for a course
export const getCourseQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.findByCourseId(req.params.courseId);

        res.status(200).json({
            message: "Successfully fetched quizzes",
            data: quizzes
        });
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({ message: "Failed to fetch quizzes", error: error.message });
    }
};

// Get single quiz with questions
export const fetchSingleQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Get questions for this quiz
        quiz.questions = await Question.findByQuizId(req.params.id);

        res.status(200).json({
            message: "Successfully fetched quiz",
            data: quiz
        });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ message: "Failed to fetch quiz", error: error.message });
    }
};

// Start quiz attempt
export const startQuiz = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const connection = await getConnection();
        try {
            // Get quiz passing score
            const quizResult = await connection.execute(
                `SELECT passing_score FROM quizzes WHERE quiz_id = :quiz_id`,
                { quiz_id: id }
            );
            const passingScore = quizResult.rows.length > 0 ? quizResult.rows[0][0] : 70;

            // Get all completed attempts for this user+quiz
            const attemptsResult = await connection.execute(
                `SELECT attempt_id, score FROM quiz_attempts WHERE user_id = :user_id AND quiz_id = :quiz_id AND completed_at IS NOT NULL ORDER BY completed_at DESC`,
                { user_id, quiz_id: id }
            );

            const completedCount = attemptsResult.rows.length;
            const bestScore = completedCount > 0 ? Math.max(...attemptsResult.rows.map(r => r[1])) : 0;
            const hasPassed = bestScore >= passingScore;

            // Review mode: if PASSED or used all 3 attempts
            if (hasPassed || completedCount >= 3) {
                const latestAttemptId = attemptsResult.rows[0][0];
                // Fetch previous answers from the latest attempt
                const answersResult = await connection.execute(
                    `SELECT ua.question_id, ua.selected_answer, ua.is_correct, ua.points_earned, q.correct_answer
                     FROM user_answers ua JOIN questions q ON ua.question_id = q.question_id
                     WHERE ua.attempt_id = :attemptId ORDER BY ua.question_id`,
                    { attemptId: latestAttemptId }
                );
                const previousAnswers = answersResult.rows.map(row => ({
                    question_id: row[0],
                    selected_answer: row[1],
                    is_correct: row[2] === 1,
                    points_earned: row[3],
                    correct_answer: row[4]
                }));
                return res.status(409).json({
                    message: hasPassed ? "Quiz passed" : "Maximum attempts reached",
                    already_completed: true,
                    data: {
                        attempt_id: latestAttemptId,
                        previous_answers: previousAnswers,
                        attempts_used: completedCount,
                        max_attempts: 3,
                        passed: hasPassed,
                        best_score: bestScore
                    }
                });
            }

            // Allow retry: delete old incomplete attempts
            await connection.execute(
                `DELETE FROM user_answers WHERE attempt_id IN (SELECT attempt_id FROM quiz_attempts WHERE user_id = :user_id AND quiz_id = :quiz_id AND completed_at IS NULL)`,
                { user_id, quiz_id: id }
            );
            await connection.execute(
                `DELETE FROM quiz_attempts WHERE user_id = :user_id AND quiz_id = :quiz_id AND completed_at IS NULL`,
                { user_id, quiz_id: id },
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }

        const attemptId = await QuizAttempt.create(user_id, id);

        res.status(200).json({
            message: "Quiz attempt started",
            data: { attempt_id: attemptId, quiz_id: id, user_id }
        });
    } catch (error) {
        console.error('Start quiz error:', error);
        res.status(500).json({ message: "Failed to start quiz", error: error.message });
    }
};

// Submit answer
export const submitAnswer = async (req, res) => {
    const { attemptId } = req.params;
    const { question_id, selected_answer } = req.body;

    try {
        // Get correct answer
        const question = await Question.findById(question_id);

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        const isCorrect = selected_answer === question.correct_answer ? 1 : 0;
        const pointsEarned = isCorrect ? question.points : 0;

        // Get next answer_id
        const answerId = await UserAnswer.getNextId();

        // Save answer
        await UserAnswer.create({
            answer_id: answerId,
            attempt_id: parseInt(attemptId),
            question_id,
            selected_answer,
            is_correct: isCorrect,
            points_earned: pointsEarned
        });

        res.status(200).json({
            message: "Answer submitted",
            data: {
                is_correct: isCorrect === 1,
                points_earned: pointsEarned,
                correct_answer: question.correct_answer
            }
        });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ message: "Failed to submit answer", error: error.message });
    }
};

// Complete quiz
export const completeQuiz = async (req, res) => {
    const { attemptId } = req.params;

    try {
        // Calculate score
        const score = await UserAnswer.getScoreByAttempt(attemptId);

        // Update attempt
        await QuizAttempt.complete(attemptId, score);

        res.status(200).json({
            message: "Quiz completed",
            data: { attempt_id: attemptId, score }
        });
    } catch (error) {
        console.error('Complete quiz error:', error);
        res.status(500).json({ message: "Failed to complete quiz", error: error.message });
    }
};

// Get completed quiz IDs for a user
export const getUserCompletedQuizzes = async (req, res) => {
    const { userId } = req.params;
    try {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT DISTINCT quiz_id FROM quiz_attempts WHERE user_id = :userId AND completed_at IS NOT NULL`,
                { userId }
            );
            const completedQuizIds = result.rows.map(row => row[0]);
            res.status(200).json({ message: "Completed quizzes fetched", data: completedQuizIds });
        } finally {
            await connection.close();
        }
    } catch (error) {
        console.error('Get completed quizzes error:', error);
        res.status(500).json({ message: "Failed to fetch completed quizzes", error: error.message });
    }
};
