// Payment Model - Oracle DB payment operations
// Adapted from INTERNATION PAYMET (replaced in-memory with Oracle)
// TuneCasa Pattern - same as Course.js, User.js
import { getConnection } from '../config/oracle.js';

export const Payment = {
    // Create payments table if not exists
    initTable: async () => {
        const connection = await getConnection();
        try {
            // Check if table exists
            const check = await connection.execute(
                `SELECT COUNT(*) FROM user_tables WHERE table_name = 'PAYMENTS'`
            );
            if (check.rows[0][0] === 0) {
                await connection.execute(`
                    CREATE TABLE payments (
                        payment_id    NUMBER PRIMARY KEY,
                        user_id       NUMBER,
                        course_id     NUMBER,
                        provider      VARCHAR2(20),
                        amount        NUMBER(10,2),
                        currency      VARCHAR2(10) DEFAULT 'usd',
                        status        VARCHAR2(30) DEFAULT 'pending',
                        transaction_id VARCHAR2(255),
                        pidx          VARCHAR2(255),
                        email         VARCHAR2(255),
                        created_date  TIMESTAMP DEFAULT SYSTIMESTAMP,
                        updated_date  TIMESTAMP DEFAULT SYSTIMESTAMP
                    )
                `);
                await connection.execute('COMMIT');
                console.log('✓ Payments table created');
            }
        } finally {
            await connection.close();
        }
    },

    // Get next payment ID
    getNextId: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute('SELECT NVL(MAX(payment_id), 0) + 1 FROM payments');
            return result.rows[0][0];
        } finally {
            await connection.close();
        }
    },

    // Create new payment record
    create: async (data) => {
        const connection = await getConnection();
        try {
            const paymentId = await Payment.getNextId();
            await connection.execute(
                `INSERT INTO payments (payment_id, user_id, course_id, provider, amount, currency, status, transaction_id, pidx, email, created_date)
                 VALUES (:payment_id, :user_id, :course_id, :provider, :amount, :currency, :status, :transaction_id, :pidx, :email, SYSTIMESTAMP)`,
                {
                    payment_id: paymentId,
                    user_id: data.user_id || null,
                    course_id: data.course_id || null,
                    provider: data.provider,
                    amount: data.amount,
                    currency: data.currency || 'usd',
                    status: data.status || 'pending',
                    transaction_id: data.transaction_id || null,
                    pidx: data.pidx || null,
                    email: data.email || null
                },
                { autoCommit: true }
            );
            return paymentId;
        } finally {
            await connection.close();
        }
    },

    // Find payment by ID
    findById: async (id) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT payment_id, user_id, course_id, provider, amount, currency, status, transaction_id, pidx, email, created_date
                 FROM payments WHERE payment_id = :id`,
                { id }
            );
            if (result.rows.length < 1) return null;

            const columns = ['payment_id', 'user_id', 'course_id', 'provider', 'amount', 'currency', 'status', 'transaction_id', 'pidx', 'email', 'created_date'];
            const payment = {};
            columns.forEach((col, i) => payment[col] = result.rows[0][i]);
            return payment;
        } finally {
            await connection.close();
        }
    },

    // Find payment by transaction ID (Stripe payment_intent ID)
    findByTransactionId: async (transactionId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT payment_id, user_id, course_id, provider, amount, currency, status, transaction_id, pidx, email
                 FROM payments WHERE transaction_id = :txn_id`,
                { txn_id: transactionId }
            );
            if (result.rows.length < 1) return null;

            const columns = ['payment_id', 'user_id', 'course_id', 'provider', 'amount', 'currency', 'status', 'transaction_id', 'pidx', 'email'];
            const payment = {};
            columns.forEach((col, i) => payment[col] = result.rows[0][i]);
            return payment;
        } finally {
            await connection.close();
        }
    },

    // Find payment by Khalti pidx
    findByPidx: async (pidx) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT payment_id, user_id, course_id, provider, amount, currency, status, transaction_id, pidx
                 FROM payments WHERE pidx = :pidx`,
                { pidx }
            );
            if (result.rows.length < 1) return null;

            const columns = ['payment_id', 'user_id', 'course_id', 'provider', 'amount', 'currency', 'status', 'transaction_id', 'pidx'];
            const payment = {};
            columns.forEach((col, i) => payment[col] = result.rows[0][i]);
            return payment;
        } finally {
            await connection.close();
        }
    },

    // Update payment status
    updateStatus: async (paymentId, status, transactionId) => {
        const connection = await getConnection();
        try {
            await connection.execute(
                `UPDATE payments SET status = :status, transaction_id = NVL(:txn_id, transaction_id), updated_date = SYSTIMESTAMP
                 WHERE payment_id = :payment_id`,
                { status, txn_id: transactionId || null, payment_id: paymentId },
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }
    },

    // Get all payments for a user
    findByUser: async (userId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT p.payment_id, p.course_id, p.provider, p.amount, p.currency, p.status, p.created_date,
                        c.title as course_title, c.youtube_url, c.instructor, c.category
                 FROM payments p
                 LEFT JOIN courses c ON p.course_id = c.course_id
                 WHERE p.user_id = :user_id AND p.status = 'completed'
                 ORDER BY p.created_date DESC`,
                { user_id: userId }
            );

            const columns = ['payment_id', 'course_id', 'provider', 'amount', 'currency', 'status', 'created_date', 'course_title', 'youtube_url', 'instructor', 'category'];
            return result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });
        } finally {
            await connection.close();
        }
    },

    // Check if user has purchased a course
    hasPurchased: async (userId, courseId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT COUNT(*) FROM payments WHERE user_id = :user_id AND course_id = :course_id AND status = 'completed'`,
                { user_id: userId, course_id: courseId }
            );
            return result.rows[0][0] > 0;
        } finally {
            await connection.close();
        }
    },

    // Find all payments for admin (with user/course info)
    findAll: async (offset = 0, limit = 50) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT p.payment_id, p.user_id, p.course_id, p.provider, p.amount, p.currency, p.status, p.transaction_id, p.created_date,
                        u.username, u.email, c.title as course_title
                 FROM payments p
                 LEFT JOIN user_profiles u ON p.user_id = u.user_id
                 LEFT JOIN courses c ON p.course_id = c.course_id
                 ORDER BY p.created_date DESC
                 OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
                { offset, limit }
            );
            const columns = ['payment_id', 'user_id', 'course_id', 'provider', 'amount', 'currency', 'status', 'transaction_id', 'created_date', 'username', 'email', 'course_title'];
            return result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });
        } finally {
            await connection.close();
        }
    },

    // Get revenue summary for admin
    getRevenue: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT
                    COUNT(*) as total_payments,
                    NVL(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
                 FROM payments`
            );
            const row = result.rows[0];
            return {
                total_payments: row[0],
                total_revenue: row[1],
                completed: row[2],
                pending: row[3],
                failed: row[4]
            };
        } finally {
            await connection.close();
        }
    },

    // Count all payments
    count: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute('SELECT COUNT(*) FROM payments');
            return result.rows[0][0];
        } finally {
            await connection.close();
        }
    }
};
