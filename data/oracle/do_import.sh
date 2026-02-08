#!/bin/bash
cd /opt/oracle/admin/FREE/dpdump/
impdp learnhub/learnhub123@localhost/FREEPDB1 directory=DATA_PUMP_DIR dumpfile=LEARNHUB_BACKUP.DMP logfile=import2.log schemas=LEARNHUB
