// Dashboard Controller - Student Dashboard API
// Aggregates data from payments, quiz_attempts, quizzes, courses
import { getConnection } from '../config/oracle.js';

// Level system thresholds
const LEVELS = [
    { level: 1, title: 'Seedling', icon: '🌱', xpRequired: 0 },
    { level: 2, title: 'Learner', icon: '📚', xpRequired: 50 },
    { level: 3, title: 'Achiever', icon: '🎯', xpRequired: 150 },
    { level: 4, title: 'Scholar', icon: '🧠', xpRequired: 350 },
    { level: 5, title: 'Expert', icon: '⭐', xpRequired: 600 },
    { level: 6, title: 'Master', icon: '🏆', xpRequired: 1000 },
];

function computeLevel(totalXP) {
    let current = LEVELS[0];
    for (const lvl of LEVELS) {
        if (totalXP >= lvl.xpRequired) current = lvl;
        else break;
    }
    const nextLevel = LEVELS.find(l => l.level === current.level + 1);
    return {
        ...current,
        totalXP,
        nextLevel: nextLevel || null,
        xpToNext: nextLevel ? nextLevel.xpRequired - totalXP : 0,
        progressPercent: nextLevel
            ? Math.round(((totalXP - current.xpRequired) / (nextLevel.xpRequired - current.xpRequired)) * 100)
            : 100,
    };
}

function detectDifficulty(quizTitle, quizIndex) {
    const t = (quizTitle || '').toLowerCase();
    if (t.includes('easy') || t.includes('basic') || t.includes('beginner')) return 'easy';
    if (t.includes('medium') || t.includes('intermediate')) return 'medium';
    if (t.includes('hard') || t.includes('advanced') || t.includes('expert')) return 'hard';
    if (quizIndex === 0) return 'easy';
    if (quizIndex === 1) return 'medium';
    if (quizIndex === 2) return 'hard';
    return 'unknown';
}

const BADGE_FOR_DIFFICULTY = { easy: 'bronze', medium: 'silver', hard: 'gold' };

// GET /api/dashboard/:userId
export const getDashboardData = async (req, res) => {
    const userId = Number(req.params.userId);
    let connection;

    try {
        connection = await getConnection();

        // 1. Purchased courses (completed payments)
        const purchasedResult = await connection.execute(
            `SELECT COUNT(*) FROM payments WHERE user_id = :userId AND status = 'completed'`,
            { userId }
        );
        const purchasedCount = purchasedResult.rows[0][0];

        // 2. Get purchased course IDs
        const purchasedCoursesResult = await connection.execute(
            `SELECT DISTINCT course_id FROM payments WHERE user_id = :userId AND status = 'completed'`,
            { userId }
        );
        const purchasedCourseIds = purchasedCoursesResult.rows.map(r => r[0]);

        // 3. Build course progress — query each course separately to avoid bind issues
        const courseProgress = [];
        const allBadges = [];
        let totalXP = 0;
        let quizzesCompleted = 0;

        for (const courseId of purchasedCourseIds) {
            // Get course details
            const courseResult = await connection.execute(
                `SELECT course_id, title, category, course_level, instructor, youtube_url 
                 FROM courses WHERE course_id = :courseId`,
                { courseId }
            );
            if (courseResult.rows.length === 0) continue;
            const [cId, cTitle, cCategory, cLevel, cInstructor, cYoutube] = courseResult.rows[0];

            // Get quizzes for this course
            const quizResult = await connection.execute(
                `SELECT quiz_id, title, passing_score FROM quizzes WHERE course_id = :courseId ORDER BY quiz_id`,
                { courseId }
            );

            const courseQuizzes = [];
            const courseBadges = [];
            let quizIndex = 0;

            for (const qRow of quizResult.rows) {
                const [quizId, quizTitle, passingScore] = qRow;

                // Get best score (from ALL attempts, not just completed_at ones — many have score but no completed_at)
                const scoreResult = await connection.execute(
                    `SELECT MAX(score), COUNT(*) FROM quiz_attempts WHERE user_id = :userId AND quiz_id = :quizId AND score IS NOT NULL`,
                    { userId, quizId }
                );
                const bestScore = scoreResult.rows[0][0];
                const attemptsUsed = scoreResult.rows[0][1];

                // Also count completed attempts
                const completedResult = await connection.execute(
                    `SELECT COUNT(*) FROM quiz_attempts WHERE user_id = :userId AND quiz_id = :quizId AND completed_at IS NOT NULL`,
                    { userId, quizId }
                );
                const completedCount = completedResult.rows[0][0];

                const difficulty = detectDifficulty(quizTitle, quizIndex);
                // Consider passed if best_score >= passing_score (regardless of completed_at — quiz system stores score even without completed_at)
                const passed = bestScore !== null && bestScore >= (passingScore || 70);
                const badgeType = BADGE_FOR_DIFFICULTY[difficulty] || null;

                if (passed || completedCount > 0) quizzesCompleted++;

                courseQuizzes.push({
                    quiz_id: quizId,
                    title: quizTitle,
                    difficulty,
                    passing_score: passingScore,
                    best_score: bestScore,
                    attempts_used: attemptsUsed,
                    passed,
                });

                if (passed && badgeType) {
                    const badge = { type: badgeType, difficulty, quiz_title: quizTitle };
                    courseBadges.push(badge);
                    allBadges.push({ ...badge, course_id: courseId, course_title: cTitle });
                }

                quizIndex++;
            }

            // Certificate check
            const easyPassed = courseQuizzes.some(q => q.difficulty === 'easy' && q.passed);
            const mediumPassed = courseQuizzes.some(q => q.difficulty === 'medium' && q.passed);
            const hardPassed = courseQuizzes.some(q => q.difficulty === 'hard' && q.passed);
            const certificateEarned = (easyPassed && mediumPassed && hardPassed) ||
                (courseQuizzes.length === 1 && courseQuizzes[0].passed);

            const totalLevels = courseQuizzes.length || 1;
            const passedLevels = courseQuizzes.filter(q => q.passed).length;
            const progressPercent = Math.round((passedLevels / totalLevels) * 100);

            // XP
            for (const q of courseQuizzes) {
                if (q.passed) {
                    if (q.difficulty === 'easy') totalXP += 10;
                    else if (q.difficulty === 'medium') totalXP += 20;
                    else if (q.difficulty === 'hard') totalXP += 30;
                    else totalXP += 15;
                }
            }
            if (certificateEarned) totalXP += 50;

            courseProgress.push({
                course_id: courseId,
                title: cTitle,
                category: cCategory,
                level: cLevel,
                instructor: cInstructor,
                youtube_url: cYoutube,
                quizzes: courseQuizzes,
                badges: courseBadges,
                certificateEarned,
                progressPercent,
            });
        }

        // 4. Certificates list
        const certificates = courseProgress
            .filter(c => c.certificateEarned)
            .map(c => ({ course_id: c.course_id, course_title: c.title, instructor: c.instructor, category: c.category }));

        // 5. Student level
        const studentLevel = computeLevel(totalXP);

        // 6. Recent activity
        let recentActivity = [];
        try {
            const activityResult = await connection.execute(
                `SELECT * FROM (
                    SELECT 'quiz_complete' AS activity_type, q.title AS detail, qa.score AS extra, qa.completed_at AS activity_date
                    FROM quiz_attempts qa
                    JOIN quizzes q ON qa.quiz_id = q.quiz_id
                    WHERE qa.user_id = :userId AND qa.score IS NOT NULL
                    UNION ALL
                    SELECT 'course_purchase' AS activity_type, c.title AS detail, p.amount AS extra, p.created_date AS activity_date
                    FROM payments p
                    JOIN courses c ON p.course_id = c.course_id
                    WHERE p.user_id = :userId AND p.status = 'completed'
                ) ORDER BY activity_date DESC NULLS LAST
                FETCH FIRST 15 ROWS ONLY`,
                { userId }
            );
            recentActivity = activityResult.rows.map(row => ({
                type: row[0], detail: row[1], extra: row[2], date: row[3],
            }));
        } catch (e) {
            console.error('Activity query error (non-fatal):', e.message);
        }

        // 7. Streak
        let currentStreak = 0;
        let weeklyActiveDays = [];
        try {
            const streakResult = await connection.execute(
                `SELECT DISTINCT TRUNC(activity_date) AS day FROM (
                    SELECT completed_at AS activity_date FROM quiz_attempts WHERE user_id = :userId AND completed_at IS NOT NULL
                    UNION ALL
                    SELECT created_date AS activity_date FROM payments WHERE user_id = :userId AND status = 'completed'
                ) WHERE activity_date IS NOT NULL ORDER BY day DESC`,
                { userId }
            );

            if (streakResult.rows.length > 0) {
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
                const firstDay = new Date(streakResult.rows[0][0]); firstDay.setHours(0, 0, 0, 0);

                if (firstDay.getTime() >= yesterday.getTime()) {
                    currentStreak = 1;
                    for (let i = 1; i < streakResult.rows.length; i++) {
                        const prev = new Date(streakResult.rows[i - 1][0]); prev.setHours(0, 0, 0, 0);
                        const curr = new Date(streakResult.rows[i][0]); curr.setHours(0, 0, 0, 0);
                        if ((prev.getTime() - curr.getTime()) / 86400000 === 1) currentStreak++;
                        else break;
                    }
                }
            }

            // Weekly
            const weeklyResult = await connection.execute(
                `SELECT DISTINCT TO_CHAR(activity_date, 'DY') FROM (
                    SELECT completed_at AS activity_date FROM quiz_attempts WHERE user_id = :userId AND completed_at IS NOT NULL AND completed_at >= TRUNC(SYSDATE, 'IW')
                    UNION ALL
                    SELECT created_date AS activity_date FROM payments WHERE user_id = :userId AND status = 'completed' AND created_date >= TRUNC(SYSDATE, 'IW')
                ) WHERE activity_date IS NOT NULL`,
                { userId }
            );
            weeklyActiveDays = weeklyResult.rows.map(r => r[0]);
        } catch (e) {
            console.error('Streak query error (non-fatal):', e.message);
        }

        res.status(200).json({
            message: 'Dashboard data fetched',
            data: {
                stats: {
                    purchasedCourses: purchasedCount,
                    quizzesCompleted,
                    certificatesEarned: certificates.length,
                    totalXP,
                    totalBadges: allBadges.length,
                },
                studentLevel,
                courseProgress,
                badges: allBadges,
                certificates,
                recentActivity,
                streak: { current: currentStreak, weeklyActiveDays },
            },
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};
