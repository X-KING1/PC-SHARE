// Authentication Configuration - LearnHub
// Reference: https://www.npmjs.com/package/jsonwebtoken

export const JWT_SECRET = process.env.JWT_SECRET || 'learnhub-secret-key-change-in-production-2024';
export const JWT_EXPIRES_IN = '7d';
export const SALT_ROUNDS = 10;

// OTP Configuration
export const OTP_EXPIRES_MINUTES = 10;
