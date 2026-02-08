-- Fix ALL quiz-related tables - Add missing columns
ALTER SESSION SET CONTAINER = orclpdb;

-- Add columns to user_answers (if not exists)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE learnhub.user_answers ADD (points_earned NUMBER(10,2) DEFAULT 0)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1430 THEN NULL; ELSE RAISE; END IF;
END;
/

-- Add columns to quiz_attempts (if not exists)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE learnhub.quiz_attempts ADD (started_at TIMESTAMP DEFAULT SYSTIMESTAMP)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1430 THEN NULL; ELSE RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE learnhub.quiz_attempts ADD (completed_at TIMESTAMP)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1430 THEN NULL; ELSE RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE learnhub.quiz_attempts ADD (total_score NUMBER(10,2) DEFAULT 0)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1430 THEN NULL; ELSE RAISE; END IF;
END;
/

COMMIT;
EXIT;
