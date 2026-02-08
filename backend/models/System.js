// System utilities - Health check and database ping
import { getConnection } from '../config/oracle.js';

export const System = {
    // Check database health
    healthCheck: async () => {
        const connection = await getConnection();
        try {
            await connection.execute('SELECT 1 FROM DUAL');
            return { status: 'healthy', database: 'connected' };
        } catch (err) {
            return { status: 'unhealthy', database: 'disconnected', error: err.message };
        } finally {
            await connection.close();
        }
    }
};
