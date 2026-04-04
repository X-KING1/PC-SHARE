// Oracle Database Configuration - TuneCasa Pattern
// Adapted for Oracle instead of MongoDB

import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

// Oracle connection configuration
const ORACLE_CONFIG = {
    user: process.env.ORACLE_USER || 'learnhub',
    password: process.env.ORACLE_PASSWORD || 'LearnHub123',
    connectString: process.env.ORACLE_DSN || '127.0.0.1:1521/orclpdb'
};

let pool = null;

const connectOracle = async () => {
    try {
        // Initialize Oracle client (platform-aware)
        try {
            const isLinux = process.platform === 'linux';
            const defaultPath = isLinux
                ? '/usr/lib/oracle/21/client64/lib'
                : 'C:\\WINDOWS.X64_193000_db_home\\bin';
            oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH || defaultPath });
        } catch (err) {
            // Already initialized or thin mode
        }

        // Fetch CLOB as string (not as stream object)
        oracledb.fetchAsString = [oracledb.CLOB];

        // Create connection pool
        pool = await oracledb.createPool({
            ...ORACLE_CONFIG,
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 1
        });

        console.log('✓ Connected to Oracle Database');
        return pool;
    } catch (err) {
        console.error('✗ Oracle connection failed:', err.message);
        throw err;
    }
};

const getConnection = async () => {
    if (!pool) {
        await connectOracle();
    }
    return await pool.getConnection();
};

const closePool = async () => {
    if (pool) {
        await pool.close(0);
        pool = null;
    }
};

export { connectOracle, getConnection, closePool };
export default connectOracle;
