@echo off
echo ============================================================
echo  LEARNHUB DATABASE EXPORT - Oracle Data Pump
echo ============================================================
echo.

echo Step 1: Creating Oracle Directory...
echo.
sqlplus -s sys/YourSysPassword@ORCL as sysdba @setup_datapump.sql

echo.
echo Step 2: Exporting database...
echo.
expdp learnhub/learnhub123@ORCL schemas=learnhub directory=DATA_PUMP_DIR dumpfile=learnhub_backup.dmp logfile=export.log

echo.
echo ============================================================
echo  EXPORT COMPLETE!
echo  File saved to: C:\oracle_backup\learnhub_backup.dmp
echo ============================================================
pause
