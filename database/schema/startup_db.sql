-- Startup script for LEARNHUB database
-- Run as: sqlplus sys/Oracle123 as sysdba @scripts/startup_db.sql

STARTUP
ALTER PLUGGABLE DATABASE orclpdb OPEN;
SELECT name, open_mode FROM v$pdbs;
EXIT;
