-- Post-Database Creation Setup Script
-- Run this after CREATE DATABASE succeeds

-- Step 1: Open/Mount the database
ALTER DATABASE MOUNT;
ALTER DATABASE OPEN;

-- Step 2: Run data dictionary catalog scripts (REQUIRED)
@?/rdbms/admin/catalog.sql
@?/rdbms/admin/catproc.sql

-- Step 3: Create LearnHub user
CREATE USER learnhub IDENTIFIED BY LearnHub123
  DEFAULT TABLESPACE users
  TEMPORARY TABLESPACE temp
  QUOTA UNLIMITED ON users;

-- Step 4: Grant privileges  
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW, CREATE SEQUENCE TO learnhub;
GRANT CREATE PROCEDURE, CREATE TRIGGER TO learnhub;
GRANT CONNECT, RESOURCE TO learnhub;

-- Verify
SELECT username, account_status FROM dba_users WHERE username = 'LEARNHUB';

EXIT;
