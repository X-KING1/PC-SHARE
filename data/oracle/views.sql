-- =====================================================
-- LEARNHUB ORACLE DATABASE VIEWS
-- Created: 2026-01-08
-- Database: Oracle 19c - LEARNHUB PDB
-- =====================================================

-- =====================================================
-- VIEW 1: V_DATABASE_STATS
-- Purpose: Summary of all table row counts
-- =====================================================
CREATE OR REPLACE VIEW v_database_stats AS
SELECT 'COURSES' AS table_name, COUNT(*) AS row_count FROM courses UNION ALL
SELECT 'QUIZZES', COUNT(*) FROM quizzes UNION ALL
SELECT 'QUESTIONS', COUNT(*) FROM questions UNION ALL
SELECT 'USER_PROFILES', COUNT(*) FROM user_profiles UNION ALL
SELECT 'USER_INTERACTIONS', COUNT(*) FROM user_interactions UNION ALL
SELECT 'ENROLLMENTS', COUNT(*) FROM enrollments UNION ALL
SELECT 'QUIZ_ATTEMPTS', COUNT(*) FROM quiz_attempts UNION ALL
SELECT 'USER_ANSWERS', COUNT(*) FROM user_answers;

-- =====================================================
-- VIEW 2: V_CATEGORY_STATS
-- Purpose: Statistics for each course category
-- =====================================================
CREATE OR REPLACE VIEW v_category_stats AS
SELECT 
    category,
    COUNT(*) AS total_courses,
    COUNT(DISTINCT subcategory) AS subcategories,
    COUNT(DISTINCT instructor) AS instructors,
    COUNT(DISTINCT course_level) AS levels
FROM courses
GROUP BY category
ORDER BY total_courses DESC;

-- =====================================================
-- VIEW 3: V_COURSE_SUMMARY
-- Purpose: Complete course overview with quiz count and ratings
-- =====================================================
CREATE OR REPLACE VIEW v_course_summary AS
SELECT 
    c.course_id,
    c.title AS course_title,
    c.category,
    c.subcategory,
    c.course_level,
    c.instructor,
    c.youtube_url,
    NVL(q.quiz_count, 0) AS total_quizzes,
    NVL(r.avg_rating, 0) AS avg_rating,
    NVL(r.total_ratings, 0) AS total_ratings
FROM courses c
LEFT JOIN (
    SELECT course_id, COUNT(*) AS quiz_count 
    FROM quizzes 
    GROUP BY course_id
) q ON c.course_id = q.course_id
LEFT JOIN (
    SELECT course_id, 
           ROUND(AVG(rating), 2) AS avg_rating, 
           COUNT(*) AS total_ratings 
    FROM user_interactions 
    WHERE rating IS NOT NULL 
    GROUP BY course_id
) r ON c.course_id = r.course_id;

-- =====================================================
-- VIEW 4: V_POPULAR_COURSES
-- Purpose: Courses ranked by popularity (number of ratings)
-- =====================================================
CREATE OR REPLACE VIEW v_popular_courses AS
SELECT 
    c.course_id,
    c.title,
    c.category,
    c.course_level,
    c.instructor,
    c.youtube_url,
    COUNT(i.interaction_id) AS total_ratings,
    ROUND(AVG(i.rating), 2) AS avg_rating,
    MAX(i.rating) AS highest_rating,
    MIN(i.rating) AS lowest_rating
FROM courses c
JOIN user_interactions i ON c.course_id = i.course_id
WHERE i.rating IS NOT NULL
GROUP BY c.course_id, c.title, c.category, c.course_level, c.instructor, c.youtube_url
ORDER BY total_ratings DESC, avg_rating DESC;

-- =====================================================
-- VIEW 5: V_QUIZ_OVERVIEW
-- Purpose: Quiz details with question counts
-- =====================================================
CREATE OR REPLACE VIEW v_quiz_overview AS
SELECT 
    q.quiz_id,
    q.title AS quiz_title,
    c.title AS course_title,
    c.category,
    c.course_level,
    NVL(qn.question_count, 0) AS total_questions,
    q.passing_score,
    q.time_limit_minutes
FROM quizzes q
JOIN courses c ON q.course_id = c.course_id
LEFT JOIN (
    SELECT quiz_id, COUNT(*) AS question_count 
    FROM questions 
    GROUP BY quiz_id
) qn ON q.quiz_id = qn.quiz_id;

-- =====================================================
-- VIEW 6: V_USER_ACTIVITY
-- Purpose: User profiles with activity statistics
-- =====================================================
CREATE OR REPLACE VIEW v_user_activity AS
SELECT 
    u.user_id,
    u.username,
    u.skill_level,
    NVL(i.courses_rated, 0) AS courses_rated,
    NVL(i.avg_rating_given, 0) AS avg_rating_given,
    NVL(e.enrollments, 0) AS total_enrollments,
    NVL(qa.quiz_attempts, 0) AS quiz_attempts
FROM user_profiles u
LEFT JOIN (
    SELECT user_id, 
           COUNT(*) AS courses_rated, 
           ROUND(AVG(rating), 2) AS avg_rating_given 
    FROM user_interactions 
    GROUP BY user_id
) i ON u.user_id = i.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) AS enrollments 
    FROM enrollments 
    GROUP BY user_id
) e ON u.user_id = e.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) AS quiz_attempts 
    FROM quiz_attempts 
    GROUP BY user_id
) qa ON u.user_id = qa.user_id;

-- =====================================================
-- VIEW 7: V_TOP_INSTRUCTORS (NEW)
-- Purpose: Instructors ranked by course count and ratings
-- =====================================================
CREATE OR REPLACE VIEW v_top_instructors AS
SELECT 
    instructor,
    COUNT(DISTINCT c.course_id) AS total_courses,
    COUNT(DISTINCT category) AS categories_taught,
    NVL(ROUND(AVG(i.rating), 2), 0) AS avg_course_rating,
    NVL(SUM(r.rating_count), 0) AS total_student_ratings
FROM courses c
LEFT JOIN (
    SELECT course_id, rating 
    FROM user_interactions 
    WHERE rating IS NOT NULL
) i ON c.course_id = i.course_id
LEFT JOIN (
    SELECT course_id, COUNT(*) AS rating_count 
    FROM user_interactions 
    WHERE rating IS NOT NULL 
    GROUP BY course_id
) r ON c.course_id = r.course_id
GROUP BY instructor
ORDER BY total_courses DESC, avg_course_rating DESC;

-- =====================================================
-- VIEW 8: V_COURSE_RATINGS (NEW)
-- Purpose: Detailed ratings breakdown per course
-- =====================================================
CREATE OR REPLACE VIEW v_course_ratings AS
SELECT 
    c.course_id,
    c.title AS course_title,
    c.category,
    COUNT(CASE WHEN i.rating = 5 THEN 1 END) AS five_star,
    COUNT(CASE WHEN i.rating = 4 THEN 1 END) AS four_star,
    COUNT(CASE WHEN i.rating = 3 THEN 1 END) AS three_star,
    COUNT(CASE WHEN i.rating = 2 THEN 1 END) AS two_star,
    COUNT(CASE WHEN i.rating = 1 THEN 1 END) AS one_star,
    COUNT(i.interaction_id) AS total_ratings,
    ROUND(AVG(i.rating), 2) AS avg_rating
FROM courses c
LEFT JOIN user_interactions i ON c.course_id = i.course_id AND i.rating IS NOT NULL
GROUP BY c.course_id, c.title, c.category
HAVING COUNT(i.interaction_id) > 0
ORDER BY avg_rating DESC, total_ratings DESC;

COMMIT;

-- =====================================================
-- VERIFY ALL VIEWS CREATED
-- =====================================================
SELECT view_name FROM user_views ORDER BY view_name;
