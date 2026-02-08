-- Insert Sample Data for LearnHub Oracle Database
-- Run as: sqlplus learnhub/LearnHub123 @insert_data.sql

SET DEFINE OFF;

-- Insert Courses (First 20)
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (1, 'Java Fundamentals', 'Comprehensive beginner course on Java', 'Programming', 'Java', 'Beginner', 'Jennifer Lee', 'RRubcjpTkks', 'https://www.youtube.com/watch?v=RRubcjpTkks');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (2, 'Professional C++', 'Comprehensive beginner course on C++', 'Programming', 'C++', 'Beginner', 'David Kim', '_zQqN5OYCCM', 'https://www.youtube.com/watch?v=_zQqN5OYCCM');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (3, 'Java for Advanced', 'Comprehensive advanced course on Java', 'Programming', 'Java', 'Advanced', 'Thomas Brown', 'v-spQPMzWJA', 'https://www.youtube.com/watch?v=v-spQPMzWJA');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (4, 'Python Fundamentals', 'Comprehensive beginner course on Python', 'Programming', 'Python', 'Beginner', 'Maria Garcia', 'fWjsdhR3z3c', 'https://www.youtube.com/watch?v=fWjsdhR3z3c');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (5, 'Professional TypeScript', 'Comprehensive advanced course on TypeScript', 'Programming', 'TypeScript', 'Advanced', 'Dr. Sarah Johnson', 'EcCTIExsqmI', 'https://www.youtube.com/watch?v=EcCTIExsqmI');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (6, 'Learn C++', 'Comprehensive advanced course on C++', 'Programming', 'C++', 'Advanced', 'Dr. Wei Zhang', '_zQqN5OYCCM', 'https://www.youtube.com/watch?v=_zQqN5OYCCM');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (7, 'Advanced C++', 'Comprehensive intermediate course on C++', 'Programming', 'C++', 'Intermediate', 'Marco Rossi', '6lU11IHfJgo', 'https://www.youtube.com/watch?v=6lU11IHfJgo');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (8, 'Learn R', 'Comprehensive beginner course on R', 'Programming', 'R', 'Beginner', 'James Wilson', 'FIrsOBy5k58', 'https://www.youtube.com/watch?v=FIrsOBy5k58');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (9, 'Rust Fundamentals', 'Comprehensive intermediate course on Rust', 'Programming', 'Rust', 'Intermediate', 'Dr. Lisa Anderson', 'HPrvAHiItQA', 'https://www.youtube.com/watch?v=HPrvAHiItQA');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (10, 'Complete R Course', 'Comprehensive intermediate course on R', 'Programming', 'R', 'Intermediate', 'David Kim', 'FIrsOBy5k58', 'https://www.youtube.com/watch?v=FIrsOBy5k58');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (11, 'Swift Bootcamp', 'Comprehensive beginner course on Swift', 'Programming', 'Swift', 'Beginner', 'Carlos Mendez', 'R4G3OHd9Kqk', 'https://www.youtube.com/watch?v=R4G3OHd9Kqk');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (12, 'Ruby from Scratch', 'Comprehensive intermediate course on Ruby', 'Programming', 'Ruby', 'Intermediate', 'Prof. Michael Chen', 'runN4gPJJzU', 'https://www.youtube.com/watch?v=runN4gPJJzU');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (13, 'Complete TypeScript', 'Comprehensive beginner course on TypeScript', 'Programming', 'TypeScript', 'Beginner', 'Dr. Priya Sharma', 'ydkQlJhodio', 'https://www.youtube.com/watch?v=ydkQlJhodio');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (14, 'TypeScript Bootcamp', 'Comprehensive intermediate course on TypeScript', 'Programming', 'TypeScript', 'Intermediate', 'Dr. Fatima Al-Sayed', 'X2f724694XQ', 'https://www.youtube.com/watch?v=X2f724694XQ');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (15, 'Ruby for Beginners', 'Comprehensive beginner course on Ruby', 'Programming', 'Ruby', 'Beginner', 'Emily Rodriguez', 'ml5sNqftiK4', 'https://www.youtube.com/watch?v=ml5sNqftiK4');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (16, 'Complete PHP Course', 'Comprehensive beginner course on PHP', 'Programming', 'PHP', 'Beginner', 'Dr. Ahmed Hassan', 'Bi-PVL-3Yq8', 'https://www.youtube.com/watch?v=Bi-PVL-3Yq8');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (17, 'Advanced C++ Pro', 'Comprehensive beginner course on C++', 'Programming', 'C++', 'Beginner', 'Dr. Priya Sharma', 'RSDzvlXmQi4', 'https://www.youtube.com/watch?v=RSDzvlXmQi4');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (18, 'Master Kotlin', 'Comprehensive advanced course on Kotlin', 'Programming', 'Kotlin', 'Advanced', 'Carlos Mendez', 'O3WLv4_ev7s', 'https://www.youtube.com/watch?v=O3WLv4_ev7s');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (19, 'Advanced Rust', 'Comprehensive intermediate course on Rust', 'Programming', 'Rust', 'Intermediate', 'Maria Garcia', 'Q_5GK7LV5oo', 'https://www.youtube.com/watch?v=Q_5GK7LV5oo');
INSERT INTO courses (course_id, title, description, category, subcategory, course_level, instructor, video_id, youtube_url) VALUES (20, 'Complete Python', 'Comprehensive beginner course on Python', 'Programming', 'Python', 'Beginner', 'Alex Johnson', 'fWjsdhR3z3c', 'https://www.youtube.com/watch?v=fWjsdhR3z3c');

-- Insert User Profiles
INSERT INTO user_profiles (user_id, age, experience) VALUES (1, 25, 'beginner');
INSERT INTO user_profiles (user_id, age, experience) VALUES (2, 30, 'intermediate');
INSERT INTO user_profiles (user_id, age, experience) VALUES (3, 22, 'beginner');
INSERT INTO user_profiles (user_id, age, experience) VALUES (4, 35, 'advanced');
INSERT INTO user_profiles (user_id, age, experience) VALUES (5, 28, 'intermediate');
INSERT INTO user_profiles (user_id, age, experience) VALUES (6, 24, 'beginner');
INSERT INTO user_profiles (user_id, age, experience) VALUES (7, 32, 'advanced');
INSERT INTO user_profiles (user_id, age, experience) VALUES (8, 27, 'intermediate');
INSERT INTO user_profiles (user_id, age, experience) VALUES (9, 23, 'beginner');
INSERT INTO user_profiles (user_id, age, experience) VALUES (10, 29, 'intermediate');

-- Insert User Interactions (Ratings)
INSERT INTO user_interactions (interaction_id, user_id, course_id, rating) VALUES (1, 1, 1, 4.5);
INSERT INTO user_interactions (interaction_id, user_id, course_id, rating) VALUES (2, 1, 4, 5.0);
INSERT INTO user_interactions (interaction_id, user_id, course_id, rating) VALUES (3, 2, 2, 4.0);
INSERT INTO user_interactions (interaction_id, user_id, course_id, rating) VALUES (4, 2, 7, 4.5);
INSERT INTO user_interactions (interaction_id, user_id, course_id, rating) VALUES (5, 3, 4, 5.0);
INSERT INTO user_interactions (interaction_id, user_id, course_id, rating) VALUES (6, 3, 15, 4.0);
INSERT INTO user_interactions (interaction_id, user_id, course_id, rating) VALUES (7, 4, 3, 4.5);
INSERT INTO user_interactions (interaction_id, user_id, course_id, rating) VALUES (8, 4, 6, 5.0);
INSERT INTO user_interactions (interaction_id, user_id, course_id, rating) VALUES (9, 5, 5, 4.0);
INSERT INTO user_interactions (interaction_id, user_id, course_id, rating) VALUES (10, 5, 14, 4.5);

-- Insert Sample Quizzes
INSERT INTO quizzes (quiz_id, course_id, title, description, time_limit, pass_score, total_questions) VALUES (1, 1, 'Java Basics Quiz', 'Test your Java fundamentals', 30, 70, 10);
INSERT INTO quizzes (quiz_id, course_id, title, description, time_limit, pass_score, total_questions) VALUES (2, 4, 'Python Basics Quiz', 'Test your Python knowledge', 30, 70, 10);
INSERT INTO quizzes (quiz_id, course_id, title, description, time_limit, pass_score, total_questions) VALUES (3, 2, 'C++ Fundamentals Quiz', 'Test your C++ skills', 30, 70, 10);

-- Insert Sample Questions
INSERT INTO questions (question_id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points) VALUES (1, 1, 'What is the main method signature in Java?', 'public static void main(String[] args)', 'void main()', 'static main(String args)', 'public main()', 'A', 10);
INSERT INTO questions (question_id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points) VALUES (2, 1, 'Which keyword is used to inherit a class in Java?', 'implements', 'extends', 'inherits', 'super', 'B', 10);
INSERT INTO questions (question_id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points) VALUES (3, 2, 'What function prints output in Python?', 'echo()', 'console.log()', 'print()', 'write()', 'C', 10);
INSERT INTO questions (question_id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points) VALUES (4, 2, 'Which symbol is used for comments in Python?', '//', '/* */', '#', '--', 'C', 10);
INSERT INTO questions (question_id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points) VALUES (5, 3, 'What is the correct way to declare a pointer in C++?', 'int ptr', 'int *ptr', 'pointer int ptr', 'int &ptr', 'B', 10);

-- Insert Sample Enrollments
INSERT INTO enrollments (enrollment_id, user_id, course_id, status) VALUES (1, 1, 1, 'active');
INSERT INTO enrollments (enrollment_id, user_id, course_id, status) VALUES (2, 1, 4, 'active');
INSERT INTO enrollments (enrollment_id, user_id, course_id, status) VALUES (3, 2, 2, 'active');
INSERT INTO enrollments (enrollment_id, user_id, course_id, status) VALUES (4, 3, 4, 'completed');
INSERT INTO enrollments (enrollment_id, user_id, course_id, status) VALUES (5, 4, 3, 'active');

COMMIT;

-- Verify Data
SELECT 'COURSES' as TBL, COUNT(*) as ROWS FROM courses;
SELECT 'USER_PROFILES' as TBL, COUNT(*) as ROWS FROM user_profiles;
SELECT 'USER_INTERACTIONS' as TBL, COUNT(*) as ROWS FROM user_interactions;
SELECT 'QUIZZES' as TBL, COUNT(*) as ROWS FROM quizzes;
SELECT 'QUESTIONS' as TBL, COUNT(*) as ROWS FROM questions;
SELECT 'ENROLLMENTS' as TBL, COUNT(*) as ROWS FROM enrollments;

PROMPT *** Data insertion complete! ***

EXIT;
