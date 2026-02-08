-- Run this in SQL*Plus as SYSDBA
-- sqlplus / as sysdba

-- Create directory for Data Pump
CREATE OR REPLACE DIRECTORY DATA_PUMP_DIR AS 'C:\oracle_backup';

-- Grant permissions to learnhub user
GRANT READ, WRITE ON DIRECTORY DATA_PUMP_DIR TO learnhub;

-- Verify
SELECT directory_name, directory_path FROM all_directories WHERE directory_name = 'DATA_PUMP_DIR';

COMMIT;

-- After running this, exit SQL*Plus and run:
-- expdp learnhub/learnhub123@ORCL schemas=learnhub directory=DATA_PUMP_DIR dumpfile=learnhub_backup.dmp logfile=export.log
