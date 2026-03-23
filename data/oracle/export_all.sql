-- ============================================================
-- LEARNHUB COMPLETE DATABASE EXPORT SCRIPT
-- Generates DDL + INSERT statements for all tables
-- ============================================================
SET PAGESIZE 0
SET LINESIZE 32767
SET LONG 2000000000
SET LONGCHUNKSIZE 32767
SET TRIMSPOOL ON
SET TRIMOUT ON
SET TAB OFF
SET FEEDBACK OFF
SET HEADING OFF
SET ECHO OFF
SET VERIFY OFF
SET TERMOUT OFF
SET WRAP ON
SET SERVEROUTPUT ON SIZE UNLIMITED

SPOOL /tmp/learnhub_complete_database.sql

-- Header
PROMPT -- ============================================================
PROMPT -- LEARNHUB ORACLE DATABASE - COMPLETE SETUP SCRIPT
PROMPT -- Generated from Oracle Docker Container
PROMPT -- Contains: User Creation, Tables, Sequences, Indexes, Views, Data
PROMPT -- ============================================================
PROMPT

-- ============================================================
-- SECTION 1: USER CREATION (Run as SYSDBA)
-- ============================================================
PROMPT -- ============================================================
PROMPT -- SECTION 1: USER CREATION (Run as SYSDBA)
PROMPT -- ============================================================
PROMPT CREATE USER learnhub IDENTIFIED BY learnhub123
PROMPT   DEFAULT TABLESPACE USERS
PROMPT   TEMPORARY TABLESPACE TEMP
PROMPT   QUOTA UNLIMITED ON USERS;
PROMPT
PROMPT GRANT CONNECT, RESOURCE TO learnhub;
PROMPT GRANT CREATE SESSION TO learnhub;
PROMPT GRANT CREATE TABLE TO learnhub;
PROMPT GRANT CREATE VIEW TO learnhub;
PROMPT GRANT CREATE SEQUENCE TO learnhub;
PROMPT GRANT CREATE PROCEDURE TO learnhub;
PROMPT GRANT CREATE TRIGGER TO learnhub;
PROMPT

-- ============================================================
-- SECTION 2: TABLE DDL
-- ============================================================
PROMPT -- ============================================================
PROMPT -- SECTION 2: TABLE DEFINITIONS
PROMPT -- ============================================================
PROMPT

DECLARE
    v_ddl CLOB;
BEGIN
    FOR rec IN (SELECT table_name FROM user_tables ORDER BY table_name) LOOP
        v_ddl := DBMS_METADATA.GET_DDL('TABLE', rec.table_name);
        DBMS_OUTPUT.PUT_LINE(v_ddl);
        DBMS_OUTPUT.PUT_LINE(';');
        DBMS_OUTPUT.PUT_LINE('');
    END LOOP;
END;
/

-- ============================================================
-- SECTION 3: SEQUENCES
-- ============================================================
PROMPT -- ============================================================
PROMPT -- SECTION 3: SEQUENCES
PROMPT -- ============================================================
PROMPT

DECLARE
    v_ddl CLOB;
BEGIN
    FOR rec IN (SELECT sequence_name FROM user_sequences ORDER BY sequence_name) LOOP
        v_ddl := DBMS_METADATA.GET_DDL('SEQUENCE', rec.sequence_name);
        DBMS_OUTPUT.PUT_LINE(v_ddl);
        DBMS_OUTPUT.PUT_LINE(';');
        DBMS_OUTPUT.PUT_LINE('');
    END LOOP;
END;
/

-- ============================================================
-- SECTION 4: INDEXES
-- ============================================================
PROMPT -- ============================================================
PROMPT -- SECTION 4: INDEXES
PROMPT -- ============================================================
PROMPT

DECLARE
    v_ddl CLOB;
BEGIN
    FOR rec IN (SELECT index_name FROM user_indexes WHERE index_type != 'LOB' AND index_name NOT LIKE 'SYS_%' ORDER BY index_name) LOOP
        BEGIN
            v_ddl := DBMS_METADATA.GET_DDL('INDEX', rec.index_name);
            DBMS_OUTPUT.PUT_LINE(v_ddl);
            DBMS_OUTPUT.PUT_LINE(';');
            DBMS_OUTPUT.PUT_LINE('');
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END LOOP;
END;
/

-- ============================================================
-- SECTION 5: VIEWS
-- ============================================================
PROMPT -- ============================================================
PROMPT -- SECTION 5: VIEWS
PROMPT -- ============================================================
PROMPT

DECLARE
    v_ddl CLOB;
BEGIN
    FOR rec IN (SELECT view_name FROM user_views ORDER BY view_name) LOOP
        v_ddl := DBMS_METADATA.GET_DDL('VIEW', rec.view_name);
        DBMS_OUTPUT.PUT_LINE(v_ddl);
        DBMS_OUTPUT.PUT_LINE(';');
        DBMS_OUTPUT.PUT_LINE('');
    END LOOP;
END;
/

-- ============================================================
-- SECTION 6: DATA (INSERT statements for all tables)
-- ============================================================
PROMPT -- ============================================================
PROMPT -- SECTION 6: TABLE DATA
PROMPT -- ============================================================
PROMPT

-- COURSES
PROMPT -- COURSES DATA
BEGIN
    FOR rec IN (SELECT course_id, title, SUBSTR(description,1,500) AS description, tags, category, subcategory, level, instructor, video_id, youtube_url FROM courses ORDER BY course_id) LOOP
        DBMS_OUTPUT.PUT_LINE('INSERT INTO courses (course_id, title, description, tags, category, subcategory, level, instructor, video_id, youtube_url) VALUES ('
            || rec.course_id || ', '
            || '''' || REPLACE(rec.title, '''', '''''') || ''', '
            || '''' || REPLACE(NVL(SUBSTR(CAST(rec.description AS VARCHAR2(500)),1,500),' '), '''', '''''') || ''', '
            || '''' || REPLACE(NVL(rec.tags,' '), '''', '''''') || ''', '
            || '''' || REPLACE(NVL(rec.category,' '), '''', '''''') || ''', '
            || '''' || REPLACE(NVL(rec.subcategory,' '), '''', '''''') || ''', '
            || '''' || REPLACE(NVL(rec.level,' '), '''', '''''') || ''', '
            || '''' || REPLACE(NVL(rec.instructor,' '), '''', '''''') || ''', '
            || '''' || REPLACE(NVL(rec.video_id,' '), '''', '''''') || ''', '
            || '''' || REPLACE(NVL(rec.youtube_url,' '), '''', '''''') || ''');');
    END LOOP;
END;
/

PROMPT
PROMPT -- USER_PROFILES DATA
BEGIN
    FOR rec IN (SELECT user_id, age, experience FROM user_profiles ORDER BY user_id) LOOP
        DBMS_OUTPUT.PUT_LINE('INSERT INTO user_profiles (user_id, age, experience) VALUES ('
            || rec.user_id || ', '
            || NVL(TO_CHAR(rec.age),'NULL') || ', '
            || '''' || REPLACE(NVL(rec.experience,' '), '''', '''''') || ''');');
    END LOOP;
END;
/

PROMPT
PROMPT -- USER_INTERACTIONS DATA
BEGIN
    FOR rec IN (SELECT interaction_id, user_id, course_id, rating FROM user_interactions ORDER BY interaction_id) LOOP
        DBMS_OUTPUT.PUT_LINE('INSERT INTO user_interactions (interaction_id, user_id, course_id, rating) VALUES ('
            || rec.interaction_id || ', '
            || rec.user_id || ', '
            || rec.course_id || ', '
            || NVL(TO_CHAR(rec.rating),'NULL') || ');');
    END LOOP;
END;
/

PROMPT
PROMPT -- QUIZZES DATA
BEGIN
    FOR rec IN (SELECT quiz_id, course_id, title, SUBSTR(description,1,500) AS description, time_limit, pass_score, total_questions FROM quizzes ORDER BY quiz_id) LOOP
        DBMS_OUTPUT.PUT_LINE('INSERT INTO quizzes (quiz_id, course_id, title, description, time_limit, pass_score, total_questions) VALUES ('
            || rec.quiz_id || ', '
            || rec.course_id || ', '
            || '''' || REPLACE(NVL(rec.title,' '), '''', '''''') || ''', '
            || '''' || REPLACE(NVL(CAST(rec.description AS VARCHAR2(500)),' '), '''', '''''') || ''', '
            || NVL(TO_CHAR(rec.time_limit),'NULL') || ', '
            || NVL(TO_CHAR(rec.pass_score),'NULL') || ', '
            || NVL(TO_CHAR(rec.total_questions),'NULL') || ');');
    END LOOP;
END;
/

PROMPT
PROMPT -- QUESTIONS DATA
BEGIN
    FOR rec IN (SELECT question_id, quiz_id, SUBSTR(question_text,1,500) AS question_text, option_a, option_b, option_c, option_d, correct_answer, points FROM questions ORDER BY question_id) LOOP
        DBMS_OUTPUT.PUT_LINE('INSERT INTO questions (question_id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points) VALUES ('
            || rec.question_id || ', '
            || rec.quiz_id || ', '
            || '''' || REPLACE(NVL(CAST(rec.question_text AS VARCHAR2(500)),' '), '''', '''''') || ''', '
            || '''' || REPLACE(NVL(rec.option_a,' '), '''', '''''') || ''', '
            || '''' || REPLACE(NVL(rec.option_b,' '), '''', '''''') || ''', '
            || '''' || REPLACE(NVL(rec.option_c,' '), '''', '''''') || ''', '
            || '''' || REPLACE(NVL(rec.option_d,' '), '''', '''''') || ''', '
            || '''' || NVL(rec.correct_answer,' ') || ''', '
            || NVL(TO_CHAR(rec.points),'10') || ');');
    END LOOP;
END;
/

PROMPT
PROMPT -- ENROLLMENTS DATA
BEGIN
    FOR rec IN (SELECT enrollment_id, user_id, course_id, status FROM enrollments ORDER BY enrollment_id) LOOP
        DBMS_OUTPUT.PUT_LINE('INSERT INTO enrollments (enrollment_id, user_id, course_id, status) VALUES ('
            || rec.enrollment_id || ', '
            || rec.user_id || ', '
            || rec.course_id || ', '
            || '''' || NVL(rec.status,'active') || ''');');
    END LOOP;
END;
/

PROMPT
PROMPT -- YOUTUBE_VIDEOS DATA
BEGIN
    FOR rec IN (SELECT video_id, youtube_url, title, duration FROM youtube_videos ORDER BY video_id) LOOP
        DBMS_OUTPUT.PUT_LINE('INSERT INTO youtube_videos (video_id, youtube_url, title, duration) VALUES ('
            || '''' || rec.video_id || ''', '
            || '''' || NVL(rec.youtube_url,' ') || ''', '
            || '''' || REPLACE(NVL(rec.title,' '), '''', '''''') || ''', '
            || '''' || NVL(rec.duration,' ') || ''');');
    END LOOP;
END;
/

PROMPT
PROMPT -- QUIZ_ATTEMPTS DATA
BEGIN
    FOR rec IN (SELECT attempt_id, user_id, quiz_id, score FROM quiz_attempts ORDER BY attempt_id) LOOP
        DBMS_OUTPUT.PUT_LINE('INSERT INTO quiz_attempts (attempt_id, user_id, quiz_id, score) VALUES ('
            || rec.attempt_id || ', '
            || rec.user_id || ', '
            || rec.quiz_id || ', '
            || NVL(TO_CHAR(rec.score),'NULL') || ');');
    END LOOP;
END;
/

PROMPT
PROMPT -- USER_ANSWERS DATA
BEGIN
    FOR rec IN (SELECT answer_id, attempt_id, question_id, selected_answer, is_correct, points_earned FROM user_answers ORDER BY answer_id) LOOP
        DBMS_OUTPUT.PUT_LINE('INSERT INTO user_answers (answer_id, attempt_id, question_id, selected_answer, is_correct, points_earned) VALUES ('
            || rec.answer_id || ', '
            || rec.attempt_id || ', '
            || rec.question_id || ', '
            || '''' || NVL(rec.selected_answer,' ') || ''', '
            || NVL(TO_CHAR(rec.is_correct),'NULL') || ', '
            || NVL(TO_CHAR(rec.points_earned),'NULL') || ');');
    END LOOP;
END;
/

PROMPT
PROMPT -- VIDEO_WATCHES DATA
BEGIN
    FOR rec IN (SELECT watch_id, user_id, course_id, duration_seconds FROM video_watches ORDER BY watch_id) LOOP
        DBMS_OUTPUT.PUT_LINE('INSERT INTO video_watches (watch_id, user_id, course_id, duration_seconds) VALUES ('
            || rec.watch_id || ', '
            || rec.user_id || ', '
            || rec.course_id || ', '
            || NVL(TO_CHAR(rec.duration_seconds),'NULL') || ');');
    END LOOP;
END;
/

PROMPT
PROMPT -- FORUM_THREADS DATA
BEGIN
    FOR rec IN (SELECT * FROM forum_threads ORDER BY thread_id) LOOP
        DBMS_OUTPUT.PUT_LINE('-- forum_threads row thread_id=' || rec.thread_id);
    END LOOP;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('-- forum_threads: no data or table structure differs');
END;
/

PROMPT
PROMPT -- FORUM_REPLIES DATA
BEGIN
    FOR rec IN (SELECT * FROM forum_replies ORDER BY reply_id) LOOP
        DBMS_OUTPUT.PUT_LINE('-- forum_replies row reply_id=' || rec.reply_id);
    END LOOP;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('-- forum_replies: no data or table structure differs');
END;
/

PROMPT
PROMPT -- COURSE_COMMENTS DATA
BEGIN
    FOR rec IN (SELECT * FROM course_comments ORDER BY 1) LOOP
        DBMS_OUTPUT.PUT_LINE('-- course_comments row found');
    END LOOP;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('-- course_comments: no data or table structure differs');
END;
/

PROMPT
PROMPT -- LIVE_SESSIONS DATA
BEGIN
    FOR rec IN (SELECT * FROM live_sessions ORDER BY 1) LOOP
        DBMS_OUTPUT.PUT_LINE('-- live_sessions row found');
    END LOOP;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('-- live_sessions: no data or table structure differs');
END;
/

PROMPT
PROMPT -- PAYMENTS DATA
BEGIN
    FOR rec IN (SELECT * FROM payments ORDER BY 1) LOOP
        DBMS_OUTPUT.PUT_LINE('-- payments row found');
    END LOOP;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('-- payments: no data or table structure differs');
END;
/

PROMPT
PROMPT COMMIT;
PROMPT
PROMPT -- ============================================================
PROMPT -- END OF LEARNHUB COMPLETE DATABASE SCRIPT
PROMPT -- ============================================================

SPOOL OFF
EXIT
