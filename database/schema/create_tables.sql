-- LearnHub Oracle Tables Creation Script
-- Run as learnhub user

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
    user_id NUMBER,
    course_id NUMBER,
    rating NUMBER(2,1),
    timestamp TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE SEQUENCE interaction_seq START WITH 1 INCREMENT BY 1;

-- Quizzes Table
CREATE TABLE quizzes (
    quiz_id NUMBER PRIMARY KEY,
    course_id NUMBER,
    title VARCHAR2(200),
    description CLOB,
    time_limit NUMBER,
    pass_score NUMBER,
    total_questions NUMBER
);

-- Questions Table
CREATE TABLE questions (
    question_id NUMBER PRIMARY KEY,
    quiz_id NUMBER,
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
    user_id NUMBER,
    course_id NUMBER,
    enrolled_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR2(20) DEFAULT 'active'
);

CREATE SEQUENCE enrollment_seq START WITH 1 INCREMENT BY 1;

-- Quiz Attempts Table
CREATE TABLE quiz_attempts (
    attempt_id NUMBER PRIMARY KEY,
    user_id NUMBER,
    quiz_id NUMBER,
    score NUMBER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE SEQUENCE quiz_attempt_seq START WITH 1 INCREMENT BY 1;

-- User Answers Table
CREATE TABLE user_answers (
    answer_id NUMBER PRIMARY KEY,
    attempt_id NUMBER,
    question_id NUMBER,
    selected_answer CHAR(1),
    is_correct NUMBER(1),
    points_earned NUMBER
);

CREATE SEQUENCE user_answer_seq START WITH 1 INCREMENT BY 1;

-- Video Watches Table
CREATE TABLE video_watches (
    watch_id NUMBER PRIMARY KEY,
    user_id NUMBER,
    course_id NUMBER,
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

-- Indexes for Performance
CREATE INDEX idx_interactions_user ON user_interactions(user_id);
CREATE INDEX idx_interactions_course ON user_interactions(course_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_questions_quiz ON questions(quiz_id);

COMMIT;

-- Verify tables created
SELECT table_name FROM user_tables ORDER BY table_name;

EXIT;
