-- Wrapper script to import learnhub_complete_database.sql
-- Handles: SET DEFINE OFF, skips user creation (already exists)
-- Run as: sqlplus learnhub/LearnHub123@localhost/orclpdb @import_wrapper.sql

SET DEFINE OFF
SET ECHO OFF
SET FEEDBACK ON
SET SERVEROUTPUT ON SIZE UNLIMITED

WHENEVER SQLERROR CONTINUE

PROMPT *** Starting full database import... ***
PROMPT *** SET DEFINE OFF to handle & characters in data ***
PROMPT

@learnhub_complete_database.sql

PROMPT
PROMPT *** Import complete! Verifying... ***

SELECT 'TABLES: ' || COUNT(*) FROM user_tables;
SELECT 'VIEWS: ' || COUNT(*) FROM user_views;
SELECT 'SEQUENCES: ' || COUNT(*) FROM user_sequences;

PROMPT
PROMPT *** Row counts: ***
SELECT 'COURSES' AS TBL, COUNT(*) AS CNT FROM courses UNION ALL
SELECT 'COURSE_COMMENTS', COUNT(*) FROM course_comments UNION ALL
SELECT 'ENROLLMENTS', COUNT(*) FROM enrollments UNION ALL
SELECT 'FORUM_REPLIES', COUNT(*) FROM forum_replies UNION ALL
SELECT 'FORUM_THREADS', COUNT(*) FROM forum_threads UNION ALL
SELECT 'LIVE_SESSIONS', COUNT(*) FROM live_sessions UNION ALL
SELECT 'PAYMENTS', COUNT(*) FROM payments UNION ALL
SELECT 'QUESTIONS', COUNT(*) FROM questions UNION ALL
SELECT 'QUIZZES', COUNT(*) FROM quizzes UNION ALL
SELECT 'QUIZ_ATTEMPTS', COUNT(*) FROM quiz_attempts UNION ALL
SELECT 'USER_ANSWERS', COUNT(*) FROM user_answers UNION ALL
SELECT 'USER_INTERACTIONS', COUNT(*) FROM user_interactions UNION ALL
SELECT 'USER_PROFILES', COUNT(*) FROM user_profiles UNION ALL
SELECT 'VIDEO_WATCHES', COUNT(*) FROM video_watches UNION ALL
SELECT 'YOUTUBE_VIDEOS', COUNT(*) FROM youtube_videos;

EXIT;
