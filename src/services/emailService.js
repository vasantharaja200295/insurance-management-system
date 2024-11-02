const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.yahoo.com',
    port: 465, 
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASSWORD, 
    },
});


class EmailService {
    static async sendVerificationEmail(email, token) {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email',
            html: `
                <h1>Welcome to Insurance Management System</h1>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationLink}">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create this account, please ignore this email.</p>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error('Failed to send verification email');
        }
    }

    static async sendPasswordResetEmail(email, token) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error('Failed to send password reset email');
        }
    }
}

module.exports = EmailService;