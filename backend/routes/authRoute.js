// Auth Routes - TuneCasa Pattern with Passport
// Reference: https://www.passportjs.org/packages/passport-github2/
import { Router } from 'express';
import passport from '../config/passport.js';

const router = Router();

// GET /api/auth/github - Start GitHub OAuth flow
// prompt: consent forces GitHub to always show authorization screen
router.route('/github').get(passport.authenticate('github', {
    scope: ['user:email'],
    prompt: 'consent'
}));

// GET /api/auth/github/switch - Switch to different GitHub account
// Reference: https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps
router.route('/github/switch').get((req, res) => {
    // Clear local session first
    req.logout(() => {
        // Manually build GitHub OAuth URL with prompt=select_account
        const clientId = process.env.GITHUB_CLIENT_ID;
        const callbackUrl = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';
        const scope = 'user:email';

        // GitHub OAuth URL with prompt=select_account to show account chooser
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${scope}&prompt=select_account`;

        res.redirect(githubAuthUrl);
    });
});

// GET /api/auth/github/callback - GitHub OAuth callback
router.route('/github/callback').get(
    passport.authenticate('github', { failureRedirect: '/?error=github_failed' }),
    (req, res) => {
        // Successful authentication - redirect to frontend with token
        const token = req.user.token;
        const user = JSON.stringify({
            user_id: req.user.user_id,
            name: req.user.name,
            email: req.user.email
        });

        // Redirect to frontend with token in URL
        res.redirect(`http://localhost:5173/auth-callback?token=${token}&user=${encodeURIComponent(user)}`);
    }
);

// GET /api/auth/user - Get current authenticated user
router.route('/user').get((req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.status(200).json({
            message: "User authenticated",
            authenticated: true,
            data: {
                user_id: req.user.user_id,
                name: req.user.name,
                email: req.user.email
            }
        });
    } else {
        res.status(200).json({ authenticated: false, data: null });
    }
});

// POST /api/auth/logout - Logout
router.route('/logout').post((req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

// GET /api/auth/logout - Logout (GET for browser redirect)
router.route('/logout').get((req, res) => {
    req.logout((err) => {
        res.redirect('http://localhost:5173/');
    });
});

export default router;
