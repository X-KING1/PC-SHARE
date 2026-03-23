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
        const offset = (page - 1) * limit;

        const [users, totalUsers] = await Promise.all([
            User.findAll(offset, limit),
            User.count()
        ]);

        res.status(200).json({
            message: "Users fetched",
            data: users,
            pagination: { page, limit, total: totalUsers, pages: Math.ceil(totalUsers / limit) }
        });
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
        const offset = (page - 1) * limit;

        const [courses, totalCourses] = await Promise.all([
            Course.findAll(offset, limit),
            Course.count()
        ]);

        res.status(200).json({
            message: "Courses fetched",
            data: courses,
            pagination: { page, limit, total: totalCourses, pages: Math.ceil(totalCourses / limit) }
        });
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
