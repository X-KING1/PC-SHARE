// Email Service - TuneCasa Pattern
// Reference: https://nodemailer.com/
// For Gmail, you need to create an App Password:
// 1. Go to Google Account → Security
// 2. Enable 2-Step Verification
// 3. Create App Password for "Mail"

import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

/**
 * Send OTP email for password reset
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise}
 */
export const sendOTPEmail = async (toEmail, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'LearnHub <noreply@learnhub.com>',
        to: toEmail,
        subject: '🔐 Password Reset OTP - LearnHub',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #9333ea; text-align: center;">🔐 Password Reset</h2>
                <p>Hello,</p>
                <p>You requested to reset your password. Use the OTP below to complete the process:</p>
                
                <div style="background: linear-gradient(135deg, #9333ea, #a855f7); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0;">
                    ${otp}
                </div>
                
                <p style="color: #666;">This OTP is valid for <strong>10 minutes</strong>.</p>
                <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">LearnHub - Smart E-Learning Platform</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        throw error;
    }
};

/**
 * Send welcome email after registration
 * @param {string} toEmail - Recipient email
 * @param {string} name - User name
 */
export const sendWelcomeEmail = async (toEmail, name) => {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'LearnHub <noreply@learnhub.com>',
        to: toEmail,
        subject: '🎉 Welcome to LearnHub!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #9333ea; text-align: center;">🎉 Welcome to LearnHub!</h2>
                <p>Hello ${name || 'Learner'},</p>
                <p>Your account has been created successfully.</p>
                <p>Start exploring our courses and enhance your skills today!</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/courses" style="background: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Browse Courses</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">LearnHub - Smart E-Learning Platform</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent to:', toEmail);
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        // Don't throw - welcome email is not critical
    }
};
