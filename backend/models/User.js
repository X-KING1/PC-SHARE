// User Model - All user-related database operations
import { getConnection } from '../config/oracle.js';

export const User = {
    // Find user by email
    findByEmail: async (email) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                'SELECT user_id, username, email, password_hash, skill_level, otp_code, otp_expires FROM user_profiles WHERE email = :email',
                { email: email.toLowerCase() }
            );

            if (result.rows.length < 1) return null;

            const columns = ['user_id', 'username', 'email', 'password_hash', 'skill_level', 'otp_code', 'otp_expires'];
            const user = {};
            columns.forEach((col, i) => user[col] = result.rows[0][i]);
            return user;
        } finally {
            await connection.close();
        }
    },

    // Find user by ID
    findById: async (id) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                'SELECT user_id, username, email, skill_level FROM user_profiles WHERE user_id = :id',
                { id }
            );

            if (result.rows.length < 1) return null;

            const columns = ['user_id', 'username', 'email', 'skill_level'];
            const user = {};
            columns.forEach((col, i) => user[col] = result.rows[0][i]);
            return user;
        } finally {
            await connection.close();
        }
    },

    // Check if email exists
    emailExists: async (email) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                'SELECT user_id FROM user_profiles WHERE email = :email',
                { email: email.toLowerCase() }
            );
            return result.rows.length > 0;
        } finally {
            await connection.close();
        }
    },

    // Get next user ID
    getNextId: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute('SELECT NVL(MAX(user_id), 0) + 1 FROM user_profiles');
            return result.rows[0][0];
        } finally {
            await connection.close();
        }
    },

    // Create new user
    create: async (userData) => {
        const connection = await getConnection();
        try {
            await connection.execute(
                `INSERT INTO user_profiles (user_id, username, email, password_hash, skill_level, created_date) 
                 VALUES (:user_id, :username, :email, :password_hash, :skill_level, SYSDATE)`,
                {
                    user_id: userData.user_id,
                    username: userData.username,
                    email: userData.email.toLowerCase(),
                    password_hash: userData.password_hash,
                    skill_level: userData.skill_level || 'Beginner'
                },
                { autoCommit: true }
            );
            return userData.user_id;
        } finally {
            await connection.close();
        }
    },

    // Update OTP for password reset
    updateOTP: async (email, otp, expires) => {
        const connection = await getConnection();
        try {
            await connection.execute(
                `UPDATE user_profiles 
                 SET otp_code = :otp, otp_expires = :expires 
                 WHERE email = :email`,
                { otp, expires, email: email.toLowerCase() },
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }
    },

    // Update password and clear OTP
    updatePassword: async (userId, passwordHash) => {
        const connection = await getConnection();
        try {
            await connection.execute(
                `UPDATE user_profiles 
                 SET password_hash = :password_hash, otp_code = NULL, otp_expires = NULL 
                 WHERE user_id = :user_id`,
                { password_hash: passwordHash, user_id: userId },
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }
    },

    // Count total users
    count: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute('SELECT COUNT(*) FROM user_profiles');
            return result.rows[0][0];
        } finally {
            await connection.close();
        }
    }
};
