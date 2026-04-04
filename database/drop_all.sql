-- Drop all existing objects before reimport
-- Run as: sqlplus learnhub/LearnHub123@localhost/orclpdb @drop_all.sql

SET SERVEROUTPUT ON

-- Drop all views
BEGIN
    FOR v IN (SELECT view_name FROM user_views) LOOP
        EXECUTE IMMEDIATE 'DROP VIEW ' || v.view_name;
        DBMS_OUTPUT.PUT_LINE('Dropped view: ' || v.view_name);
    END LOOP;
END;
/

-- Drop all tables (disable constraints first)
BEGIN
    FOR c IN (SELECT table_name, constraint_name FROM user_constraints WHERE constraint_type = 'R') LOOP
        EXECUTE IMMEDIATE 'ALTER TABLE ' || c.table_name || ' DROP CONSTRAINT ' || c.constraint_name;
        DBMS_OUTPUT.PUT_LINE('Dropped constraint: ' || c.constraint_name);
    END LOOP;
END;
/

BEGIN
    FOR t IN (SELECT table_name FROM user_tables) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS PURGE';
        DBMS_OUTPUT.PUT_LINE('Dropped table: ' || t.table_name);
    END LOOP;
END;
/

-- Drop all sequences
BEGIN
    FOR s IN (SELECT sequence_name FROM user_sequences) LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || s.sequence_name;
        DBMS_OUTPUT.PUT_LINE('Dropped sequence: ' || s.sequence_name);
    END LOOP;
END;
/

PROMPT *** All objects dropped! ***
SELECT COUNT(*) AS remaining_tables FROM user_tables;
SELECT COUNT(*) AS remaining_views FROM user_views;
SELECT COUNT(*) AS remaining_sequences FROM user_sequences;

EXIT;
