-- LearnHub Oracle Database Setup Script
-- Run this as SYSDBA to create the LearnHub user and schema

-- Step 1: Create User
CREATE USER learnhub IDENTIFIED BY learnhub123
  DEFAULT TABLESPACE USERS
  TEMPORARY TABLESPACE TEMP
  QUOTA UNLIMITED ON USERS;

-- Step 2: Grant Privileges
GRANT CONNECT, RESOURCE TO learnhub;
GRANT CREATE SESSION TO learnhub;
GRANT CREATE TABLE TO learnhub;
GRANT CREATE VIEW TO learnhub;
GRANT CREATE SEQUENCE TO learnhub;
GRANT CREATE PROCEDURE TO learnhub;

-- Step 3: Connect as learnhub user
-- After running above, connect with: sqlplus learnhub/learnhub123@ORCL

-- ============================================================================
-- TABLES (Run as learnhub user)
-- ============================================================================

-- Courses Table
CREATE TABLE courses (
    course_id NUMBER PRIMARY KEY,
    title VARCHAR2(200) NOT NULL,
    description CLOB,
    tags VARCHAR2(500),
    category VARCHAR2(100),
    subcategory VARCHAR2(100),
    level VARCHAR2(50),
    instructor VARCHAR2(200),
    learning_outcomes CLOB,
    video_id VARCHAR2(50),
    youtube_url VARCHAR2(200),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- User Profiles Table
CREATE TABLE user_profiles (
    user_id NUMBER PRIMARY KEY,
    age NUMBER,
    experience VARCHAR2(50),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- User Interactions Table
CREATE TABLE user_interactions (
    interaction_id NUMBER PRIMARY KEY,
    user_id NUMBER REFERENCES user_profiles(user_id),
    course_id NUMBER REFERENCES courses(course_id),
    rating NUMBER(2,1),
    timestamp TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE SEQUENCE interaction_seq START WITH 1 INCREMENT BY 1;

-- Quizzes Table
CREATE TABLE quizzes (
    quiz_id NUMBER PRIMARY KEY,
    course_id NUMBER REFERENCES courses(course_id),
    title VARCHAR2(200),
    description CLOB,
    time_limit NUMBER,
    pass_score NUMBER,
    total_questions NUMBER
);

-- Questions Table
CREATE TABLE questions (
    question_id NUMBER PRIMARY KEY,
    quiz_id NUMBER REFERENCES quizzes(quiz_id),
    question_text CLOB,
    option_a VARCHAR2(500),
    option_b VARCHAR2(500),
    option_c VARCHAR2(500),
    option_d VARCHAR2(500),
    correct_answer CHAR(1),
    points NUMBER DEFAULT 10
);

-- Enrollments Table
CREATE TABLE enrollments (
    enrollment_id NUMBER PRIMARY KEY,
    user_id NUMBER REFERENCES user_profiles(user_id),
    course_id NUMBER REFERENCES courses(course_id),
    enrolled_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR2(20) DEFAULT 'active'
);

CREATE SEQUENCE enrollment_seq START WITH 1 INCREMENT BY 1;

-- Quiz Attempts Table
CREATE TABLE quiz_attempts (
    attempt_id NUMBER PRIMARY KEY,
    user_id NUMBER REFERENCES user_profiles(user_id),
    quiz_id NUMBER REFERENCES quizzes(quiz_id),
    score NUMBER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE SEQUENCE quiz_attempt_seq START WITH 1 INCREMENT BY 1;

-- User Answers Table
CREATE TABLE user_answers (
    answer_id NUMBER PRIMARY KEY,
    attempt_id NUMBER REFERENCES quiz_attempts(attempt_id),
    question_id NUMBER REFERENCES questions(question_id),
    selected_answer CHAR(1),
    is_correct NUMBER(1),
    points_earned NUMBER
);

CREATE SEQUENCE user_answer_seq START WITH 1 INCREMENT BY 1;

-- Video Watches Table
CREATE TABLE video_watches (
    watch_id NUMBER PRIMARY KEY,
    user_id NUMBER REFERENCES user_profiles(user_id),
    course_id NUMBER REFERENCES courses(course_id),
    watched_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    duration_seconds NUMBER
);

CREATE SEQUENCE video_watch_seq START WITH 1 INCREMENT BY 1;

-- YouTube Videos Table
CREATE TABLE youtube_videos (
    video_id VARCHAR2(50) PRIMARY KEY,
    youtube_url VARCHAR2(200),
    title VARCHAR2(300),
    duration VARCHAR2(20)
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

CREATE INDEX idx_interactions_user ON user_interactions(user_id);
CREATE INDEX idx_interactions_course ON user_interactions(course_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_questions_quiz ON questions(quiz_id);

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run: SELECT table_name FROM user_tables ORDER BY table_name;
