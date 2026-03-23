// User Controller - Using User Model
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN, SALT_ROUNDS, OTP_EXPIRES_MINUTES } from '../config/authConfig.js';
import { sendOTPEmail, sendWelcomeEmail } from '../services/emailService.js';

// ==================== REGISTER ====================
export const register = async (req, res) => {
    const { name, email, password, skill_level, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    try {
        // Check if user exists
        const exists = await User.emailExists(email);
        if (exists) {
            return res.status(409).json({ message: "User already exists with this email" });
        }

        // Hash password with bcrypt
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Get next user_id
        const newUserId = await User.getNextId();

        // Create user
        await User.create({
            user_id: newUserId,
            username: name,
            email: email,
            password_hash: passwordHash,
            skill_level: skill_level || 'Beginner',
            role: role || 'student'
        });

        // Generate JWT token
        const token = jwt.sign(
            { user_id: newUserId, email: email.toLowerCase(), role: role || 'student' },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(200).json({
            message: "User registered successfully",
            data: {
                user_id: newUserId,
                name,
                email: email.toLowerCase(),
                skill_level: skill_level || 'Beginner',
                role: role || 'student'
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

// ==================== LOGIN ====================
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Find user by email
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role || 'student' },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(200).json({
            message: "Login successful",
            data: {
                user_id: user.user_id,
                name: user.username,
                email: user.email,
                skill_level: user.skill_level,
                role: user.role || 'student'
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

// ==================== LOGOUT ====================
export const logout = async (req, res) => {
    // JWT is stateless, so logout is handled on frontend by removing token
    res.status(200).json({ message: "Logged out successfully" });
};

// ==================== GET CURRENT USER (ME) ====================
export const getCurrentUser = async (req, res) => {
    // req.user is set by authMiddleware
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const user = await User.findById(req.user.user_id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User fetched successfully",
            data: {
                user_id: user.user_id,
                name: user.username,
                email: user.email,
                skill_level: user.skill_level,
                role: user.role || 'student'
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: "Failed to fetch user", error: error.message });
    }
};

// ==================== FORGOT PASSWORD ====================
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Check if user exists
        const user = await User.findByEmail(email);

        if (!user) {
            // Don't reveal if user exists (security)
            return res.status(200).json({ message: "If email exists, OTP has been sent" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

        // Store OTP in database
        await User.updateOTP(email, otp, expiresAt);

        // Send OTP via email
        try {
            await sendOTPEmail(email.toLowerCase(), otp);
            console.log(`[PASSWORD RESET] OTP sent to ${email}`);
        } catch (emailError) {
            console.error('Email send failed:', emailError);
            // Still return success - OTP is in database
        }

        res.status(200).json({
            message: "OTP sent to your email"
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

// ==================== RESET PASSWORD ====================
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    try {
        // Find user and verify OTP
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }

        if (!user.otp_code || user.otp_code !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date() > new Date(user.otp_expires)) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update password and clear OTP
        await User.updatePassword(user.user_id, passwordHash);

        res.status(200).json({ message: "Password reset successful. You can now login." });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: "Failed to reset password" });
    }
};

// ==================== GET SINGLE USER ====================
export const fetchSingleUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Successfully fetched user",
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: "Failed to fetch user", error: error.message });
    }
};
