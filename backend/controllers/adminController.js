// Admin Controller — All admin dashboard API endpoints
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Payment } from '../models/Payment.js';
import { Quiz } from '../models/Quiz.js';
import { Interaction } from '../models/Interaction.js';
import { Forum } from '../models/Forum.js';
import { LiveSession } from '../models/LiveSession.js';
import { getConnection } from '../config/oracle.js';

// ─── Overview Stats ────────────────────────────────────────
export const getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalCourses, totalQuizzes, totalInteractions, revenue] = await Promise.all([
            User.count(),
            Course.count(),
            Quiz.count(),
            Interaction.count(),
            Payment.getRevenue()
        ]);

        // Count users by role
        const connection = await getConnection();
        let roleBreakdown = { students: 0, mentors: 0, admins: 0 };
        let forumStats = { threads: 0, replies: 0 };
        let sessionStats = { total: 0, available: 0, booked: 0, completed: 0 };
        let recentUsers = [];

        try {
            const roleResult = await connection.execute(
                `SELECT role, COUNT(*) FROM user_profiles GROUP BY role`
            );
            roleResult.rows.forEach(row => {
                if (row[0] === 'student') roleBreakdown.students = row[1];
                else if (row[0] === 'mentor') roleBreakdown.mentors = row[1];
                else if (row[0] === 'admin') roleBreakdown.admins = row[1];
            });

            // Forum stats
            try {
                const threadCount = await connection.execute('SELECT COUNT(*) FROM forum_threads');
                const replyCount = await connection.execute('SELECT COUNT(*) FROM forum_replies');
                forumStats = { threads: threadCount.rows[0][0], replies: replyCount.rows[0][0] };
            } catch (e) { /* tables may not exist */ }

            // Session stats
            try {
                const sessResult = await connection.execute(
                    `SELECT status, COUNT(*) FROM live_sessions GROUP BY status`
                );
                sessResult.rows.forEach(row => {
                    sessionStats.total += row[1];
                    if (row[0] === 'available') sessionStats.available = row[1];
                    else if (row[0] === 'booked') sessionStats.booked = row[1];
                    else if (row[0] === 'completed') sessionStats.completed = row[1];
                });
            } catch (e) { /* table may not exist */ }

            // Recent users (last 5)
            try {
                const recentResult = await connection.execute(
                    `SELECT user_id, username, email, role, created_date
                     FROM user_profiles ORDER BY user_id DESC
                     FETCH FIRST 5 ROWS ONLY`
                );
                const cols = ['user_id', 'username', 'email', 'role', 'created_date'];
                recentUsers = recentResult.rows.map(row => {
                    const obj = {};
                    cols.forEach((c, i) => obj[c] = row[i]);
                    return obj;
                });
            } catch (e) { /* ignore */ }
        } finally {
            await connection.close();
        }

        res.status(200).json({
            message: "Admin stats fetched",
            data: {
                total_users: totalUsers,
                total_courses: totalCourses,
                total_quizzes: totalQuizzes,
                total_interactions: totalInteractions,
                revenue,
                role_breakdown: roleBreakdown,
                forum: forumStats,
                sessions: sessionStats,
                recent_users: recentUsers
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ message: "Failed to fetch admin stats", error: error.message });
    }
};

// ─── Users ─────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = (req.query.search || '').trim();
        const offset = (page - 1) * limit;

        const connection = await getConnection();
        try {
            let query, countQuery, params = {};
            if (search) {
                params.search = `%${search.toLowerCase()}%`;
                countQuery = `SELECT COUNT(*) FROM user_profiles WHERE LOWER(username) LIKE :search OR LOWER(email) LIKE :search`;
                query = `SELECT user_id, username, email, role, skill_level, created_date 
                         FROM user_profiles WHERE LOWER(username) LIKE :search OR LOWER(email) LIKE :search
                         ORDER BY user_id DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
            } else {
                countQuery = `SELECT COUNT(*) FROM user_profiles`;
                query = `SELECT user_id, username, email, role, skill_level, created_date 
                         FROM user_profiles ORDER BY user_id DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
            }
            const countResult = await connection.execute(countQuery, params);
            const totalUsers = countResult.rows[0][0];
            const result = await connection.execute(query, { ...params, offset, limit });
            const columns = ['user_id', 'username', 'email', 'role', 'skill_level', 'created_date'];
            const users = result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });

            res.status(200).json({
                message: "Users fetched",
                data: users,
                pagination: { page, limit, total: totalUsers, pages: Math.ceil(totalUsers / limit) }
            });
        } finally {
            await connection.close();
        }
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['student', 'mentor', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be student, mentor, or admin." });
        }

        await User.updateRole(id, role);
        res.status(200).json({ message: `User role updated to ${role}` });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: "Failed to update role", error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.delete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
};

// ─── Courses ───────────────────────────────────────────────
export const getAllCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = (req.query.search || '').trim();
        const offset = (page - 1) * limit;

        const connection = await getConnection();
        try {
            let query, countQuery, params = {};
            if (search) {
                params.search = `%${search.toLowerCase()}%`;
                countQuery = `SELECT COUNT(*) FROM courses WHERE LOWER(title) LIKE :search OR LOWER(category) LIKE :search`;
                query = `SELECT course_id, title, description, category, subcategory, course_level, instructor, youtube_url 
                         FROM courses WHERE LOWER(title) LIKE :search OR LOWER(category) LIKE :search
                         ORDER BY course_id DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
            } else {
                countQuery = `SELECT COUNT(*) FROM courses`;
                query = `SELECT course_id, title, description, category, subcategory, course_level, instructor, youtube_url 
                         FROM courses ORDER BY course_id DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
            }
            const countResult = await connection.execute(countQuery, params);
            const totalCourses = countResult.rows[0][0];
            const result = await connection.execute(query, { ...params, offset, limit });
            const columns = ['course_id', 'title', 'description', 'category', 'subcategory', 'level', 'instructor', 'youtube_url'];
            const courses = result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });

            res.status(200).json({
                message: "Courses fetched",
                data: courses,
                pagination: { page, limit, total: totalCourses, pages: Math.ceil(totalCourses / limit) }
            });
        } finally {
            await connection.close();
        }
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: "Failed to fetch courses", error: error.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        try {
            await connection.execute('DELETE FROM courses WHERE course_id = :id', { id }, { autoCommit: true });
        } finally {
            await connection.close();
        }
        res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ message: "Failed to delete course", error: error.message });
    }
};

// ─── Payments ──────────────────────────────────────────────
export const getAllPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const [payments, revenue] = await Promise.all([
            Payment.findAll(offset, limit),
            Payment.getRevenue()
        ]);

        res.status(200).json({
            message: "Payments fetched",
            data: payments,
            revenue,
            pagination: { page, limit, total: revenue.total_payments, pages: Math.ceil(revenue.total_payments / limit) }
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ message: "Failed to fetch payments", error: error.message });
    }
};

// ─── Quizzes ───────────────────────────────────────────────
export const getAllQuizzes = async (req, res) => {
    try {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT q.quiz_id, q.course_id, q.title, q.passing_score,
                        c.title as course_title,
                        (SELECT COUNT(*) FROM questions qn WHERE qn.quiz_id = q.quiz_id) as question_count,
                        (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.quiz_id = q.quiz_id) as attempt_count
                 FROM quizzes q
                 LEFT JOIN courses c ON q.course_id = c.course_id
                 ORDER BY q.quiz_id DESC`
            );
            const columns = ['quiz_id', 'course_id', 'title', 'passing_score', 'course_title', 'question_count', 'attempt_count'];
            const quizzes = result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });

            res.status(200).json({ message: "Quizzes fetched", data: quizzes });
        } finally {
            await connection.close();
        }
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({ message: "Failed to fetch quizzes", error: error.message });
    }
};

// ─── Forum ─────────────────────────────────────────────────
export const getAllThreads = async (req, res) => {
    try {
        const threads = await Forum.getAllThreads();
        res.status(200).json({ message: "Threads fetched", data: threads });
    } catch (error) {
        console.error('Get threads error:', error);
        res.status(500).json({ message: "Failed to fetch threads", error: error.message });
    }
};

export const deleteThread = async (req, res) => {
    try {
        await Forum.deleteThread(req.params.id);
        res.status(200).json({ message: "Thread deleted" });
    } catch (error) {
        console.error('Delete thread error:', error);
        res.status(500).json({ message: "Failed to delete thread", error: error.message });
    }
};

export const deleteReply = async (req, res) => {
    try {
        await Forum.deleteReply(req.params.id);
        res.status(200).json({ message: "Reply deleted" });
    } catch (error) {
        console.error('Delete reply error:', error);
        res.status(500).json({ message: "Failed to delete reply", error: error.message });
    }
};

// ─── Live Sessions ─────────────────────────────────────────
export const getAllSessions = async (req, res) => {
    try {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT session_id, course_id, mentor_id, mentor_name, title, session_date, start_time, duration_minutes, status, student_id, student_name, room_id, created_date
                 FROM live_sessions ORDER BY created_date DESC`
            );
            const columns = ['session_id', 'course_id', 'mentor_id', 'mentor_name', 'title', 'session_date', 'start_time', 'duration_minutes', 'status', 'student_id', 'student_name', 'room_id', 'created_date'];
            const sessions = result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });
            res.status(200).json({ message: "Sessions fetched", data: sessions });
        } finally {
            await connection.close();
        }
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ message: "Failed to fetch sessions", error: error.message });
    }
};

export const deleteSession = async (req, res) => {
    try {
        await LiveSession.remove(req.params.id);
        res.status(200).json({ message: "Session deleted" });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ message: "Failed to delete session", error: error.message });
    }
};

// ─── Quiz CRUD ─────────────────────────────────────────────
export const createQuiz = async (req, res) => {
    const { course_id, title, description, passing_score, time_limit, questions } = req.body;
    if (!course_id || !title) {
        return res.status(400).json({ message: "course_id and title are required" });
    }
    const connection = await getConnection();
    try {
        // Insert quiz
        const idResult = await connection.execute('SELECT NVL(MAX(quiz_id), 0) + 1 FROM quizzes');
        const quizId = idResult.rows[0][0];
        await connection.execute(
            `INSERT INTO quizzes (quiz_id, course_id, title, description, passing_score, time_limit_minutes)
             VALUES (:quiz_id, :course_id, :title, :description, :passing_score, :time_limit)`,
            {
                quiz_id: quizId,
                course_id,
                title,
                description: description || null,
                passing_score: passing_score || 70,
                time_limit: time_limit || 30
            }
        );

        // Insert questions if provided
        if (questions && questions.length > 0) {
            const qIdResult = await connection.execute('SELECT NVL(MAX(question_id), 0) FROM questions');
            let nextQId = qIdResult.rows[0][0] + 1;
            for (const q of questions) {
                await connection.execute(
                    `INSERT INTO questions (question_id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
                     VALUES (:qid, :quiz_id, :question_text, :option_a, :option_b, :option_c, :option_d, :correct_answer)`,
                    {
                        qid: nextQId++,
                        quiz_id: quizId,
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        correct_answer: q.correct_answer
                    }
                );
            }
        }
        await connection.execute('COMMIT');
        res.status(201).json({ message: "Quiz created", data: { quiz_id: quizId } });
    } catch (error) {
        await connection.execute('ROLLBACK');
        console.error('Create quiz error:', error);
        res.status(500).json({ message: "Failed to create quiz", error: error.message });
    } finally {
        await connection.close();
    }
};

export const getQuizDetails = async (req, res) => {
    const { id } = req.params;
    const connection = await getConnection();
    try {
        const quizResult = await connection.execute(
            `SELECT q.quiz_id, q.course_id, q.title, q.description, q.passing_score, q.time_limit_minutes,
                    c.title as course_title,
                    (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.quiz_id = q.quiz_id) as attempt_count
             FROM quizzes q LEFT JOIN courses c ON q.course_id = c.course_id
             WHERE q.quiz_id = :id`,
            { id }
        );
        if (quizResult.rows.length === 0) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        const cols = ['quiz_id', 'course_id', 'title', 'description', 'passing_score', 'time_limit_minutes', 'course_title', 'attempt_count'];
        const quiz = {};
        cols.forEach((col, i) => quiz[col] = quizResult.rows[0][i]);

        // Get questions
        const qResult = await connection.execute(
            `SELECT question_id, question_text, option_a, option_b, option_c, option_d, correct_answer
             FROM questions WHERE quiz_id = :id ORDER BY question_id`,
            { id }
        );
        const qCols = ['question_id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];
        quiz.questions = qResult.rows.map(row => {
            const obj = {};
            qCols.forEach((col, i) => obj[col] = row[i]);
            return obj;
        });

        res.status(200).json({ message: "Quiz details fetched", data: quiz });
    } catch (error) {
        console.error('Get quiz details error:', error);
        res.status(500).json({ message: "Failed to fetch quiz details", error: error.message });
    } finally {
        await connection.close();
    }
};

export const updateQuiz = async (req, res) => {
    const { id } = req.params;
    const { title, description, passing_score, time_limit, course_id } = req.body;
    const connection = await getConnection();
    try {
        const fields = [];
        const params = { id };
        if (title !== undefined) { fields.push('title = :title'); params.title = title; }
        if (description !== undefined) { fields.push('description = :description'); params.description = description; }
        if (passing_score !== undefined) { fields.push('passing_score = :passing_score'); params.passing_score = passing_score; }
        if (time_limit !== undefined) { fields.push('time_limit_minutes = :time_limit'); params.time_limit = time_limit; }
        if (course_id !== undefined) { fields.push('course_id = :course_id'); params.course_id = course_id; }
        if (fields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        await connection.execute(
            `UPDATE quizzes SET ${fields.join(', ')} WHERE quiz_id = :id`,
            params,
            { autoCommit: true }
        );
        res.status(200).json({ message: "Quiz updated" });
    } catch (error) {
        console.error('Update quiz error:', error);
        res.status(500).json({ message: "Failed to update quiz", error: error.message });
    } finally {
        await connection.close();
    }
};

export const deleteQuiz = async (req, res) => {
    const { id } = req.params;
    const connection = await getConnection();
    try {
        // Cascade: user_answers → quiz_attempts → questions → quiz
        await connection.execute(
            `DELETE FROM user_answers WHERE attempt_id IN (SELECT attempt_id FROM quiz_attempts WHERE quiz_id = :id)`,
            { id }
        );
        await connection.execute('DELETE FROM quiz_attempts WHERE quiz_id = :id', { id });
        await connection.execute('DELETE FROM questions WHERE quiz_id = :id', { id });
        await connection.execute('DELETE FROM quizzes WHERE quiz_id = :id', { id });
        await connection.execute('COMMIT');
        res.status(200).json({ message: "Quiz deleted" });
    } catch (error) {
        await connection.execute('ROLLBACK');
        console.error('Delete quiz error:', error);
        res.status(500).json({ message: "Failed to delete quiz", error: error.message });
    } finally {
        await connection.close();
    }
};

// ─── Question Management ───────────────────────────────────
export const addQuestion = async (req, res) => {
    const { id } = req.params; // quiz_id
    const { question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;
    if (!question_text || !correct_answer) {
        return res.status(400).json({ message: "question_text and correct_answer are required" });
    }
    const connection = await getConnection();
    try {
        const idResult = await connection.execute('SELECT NVL(MAX(question_id), 0) + 1 FROM questions');
        const questionId = idResult.rows[0][0];
        await connection.execute(
            `INSERT INTO questions (question_id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
             VALUES (:qid, :quiz_id, :question_text, :option_a, :option_b, :option_c, :option_d, :correct_answer)`,
            { qid: questionId, quiz_id: id, question_text, option_a, option_b, option_c, option_d, correct_answer },
            { autoCommit: true }
        );
        res.status(201).json({ message: "Question added", data: { question_id: questionId } });
    } catch (error) {
        console.error('Add question error:', error);
        res.status(500).json({ message: "Failed to add question", error: error.message });
    } finally {
        await connection.close();
    }
};

export const updateQuestion = async (req, res) => {
    const { id } = req.params; // question_id
    const { question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;
    const connection = await getConnection();
    try {
        const fields = [];
        const params = { id };
        if (question_text !== undefined) { fields.push('question_text = :question_text'); params.question_text = question_text; }
        if (option_a !== undefined) { fields.push('option_a = :option_a'); params.option_a = option_a; }
        if (option_b !== undefined) { fields.push('option_b = :option_b'); params.option_b = option_b; }
        if (option_c !== undefined) { fields.push('option_c = :option_c'); params.option_c = option_c; }
        if (option_d !== undefined) { fields.push('option_d = :option_d'); params.option_d = option_d; }
        if (correct_answer !== undefined) { fields.push('correct_answer = :correct_answer'); params.correct_answer = correct_answer; }
        if (fields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        await connection.execute(
            `UPDATE questions SET ${fields.join(', ')} WHERE question_id = :id`,
            params,
            { autoCommit: true }
        );
        res.status(200).json({ message: "Question updated" });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ message: "Failed to update question", error: error.message });
    } finally {
        await connection.close();
    }
};

export const deleteQuestion = async (req, res) => {
    const { id } = req.params; // question_id
    const connection = await getConnection();
    try {
        await connection.execute('DELETE FROM user_answers WHERE question_id = :id', { id });
        await connection.execute('DELETE FROM questions WHERE question_id = :id', { id });
        await connection.execute('COMMIT');
        res.status(200).json({ message: "Question deleted" });
    } catch (error) {
        await connection.execute('ROLLBACK');
        console.error('Delete question error:', error);
        res.status(500).json({ message: "Failed to delete question", error: error.message });
    } finally {
        await connection.close();
    }
};

// ─── Forum Detail + Stats ──────────────────────────────────
export const getThreadDetails = async (req, res) => {
    try {
        const thread = await Forum.getThread(req.params.id);
        if (!thread) {
            return res.status(404).json({ message: "Thread not found" });
        }
        res.status(200).json({ message: "Thread details fetched", data: thread });
    } catch (error) {
        console.error('Get thread details error:', error);
        res.status(500).json({ message: "Failed to fetch thread details", error: error.message });
    }
};

export const getForumStats = async (req, res) => {
    const connection = await getConnection();
    try {
        let stats = { total_threads: 0, total_replies: 0, most_active: [], recent_threads: [] };
        try {
            const tc = await connection.execute('SELECT COUNT(*) FROM forum_threads');
            stats.total_threads = tc.rows[0][0];
            const rc = await connection.execute('SELECT COUNT(*) FROM forum_replies');
            stats.total_replies = rc.rows[0][0];

            // Most active posters
            const active = await connection.execute(
                `SELECT author, COUNT(*) as post_count FROM (
                    SELECT author FROM forum_threads UNION ALL SELECT author FROM forum_replies
                ) GROUP BY author ORDER BY post_count DESC FETCH FIRST 5 ROWS ONLY`
            );
            stats.most_active = active.rows.map(r => ({ author: r[0], count: r[1] }));

            // Recent threads
            const recent = await connection.execute(
                `SELECT thread_id, title, author, created_date,
                        (SELECT COUNT(*) FROM forum_replies r WHERE r.thread_id = t.thread_id) as reply_count
                 FROM forum_threads t ORDER BY created_date DESC FETCH FIRST 5 ROWS ONLY`
            );
            stats.recent_threads = recent.rows.map(r => ({
                thread_id: r[0], title: r[1], author: r[2], created_date: r[3], reply_count: r[4]
            }));
        } catch (e) { /* tables may not exist */ }
        res.status(200).json({ message: "Forum stats fetched", data: stats });
    } catch (error) {
        console.error('Forum stats error:', error);
        res.status(500).json({ message: "Failed to fetch forum stats", error: error.message });
    } finally {
        await connection.close();
    }
};
