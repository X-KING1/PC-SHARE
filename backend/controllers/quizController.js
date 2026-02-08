// Quiz Controller - Using Quiz, Question, QuizAttempt, UserAnswer Models
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { UserAnswer } from '../models/UserAnswer.js';

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
