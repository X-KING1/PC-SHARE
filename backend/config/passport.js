// Passport Configuration - TuneCasa Pattern
// Reference: https://www.passportjs.org/packages/passport-github2/
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { getConnection } from './oracle.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from './authConfig.js';

// Serialize user to session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Configure GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const connection = await getConnection();

        // Check if user exists with this GitHub ID
        const email = profile.emails?.[0]?.value || `${profile.username}@github.user`;

        const existResult = await connection.execute(
            'SELECT user_id, username, email FROM user_profiles WHERE email = :email OR github_id = :github_id',
            { email, github_id: profile.id }
        );

        let user;

        if (existResult.rows.length > 0) {
            // User exists - update GitHub info
            const [user_id, username, userEmail] = existResult.rows[0];

            await connection.execute(
                `UPDATE user_profiles SET github_id = :github_id, github_username = :github_username, avatar_url = :avatar WHERE user_id = :user_id`,
                {
                    github_id: profile.id,
                    github_username: profile.username,
                    avatar: profile.photos?.[0]?.value,
                    user_id
                },
                { autoCommit: true }
            );

            user = { user_id, name: username, email: userEmail };
        } else {
            // Create new user
            const maxResult = await connection.execute('SELECT NVL(MAX(user_id), 0) + 1 FROM user_profiles');
            const newUserId = maxResult.rows[0][0];

            await connection.execute(
                `INSERT INTO user_profiles (user_id, username, email, github_id, github_username, avatar_url, created_date) 
                 VALUES (:user_id, :username, :email, :github_id, :github_username, :avatar, SYSDATE)`,
                {
                    user_id: newUserId,
                    username: profile.displayName || profile.username,
                    email,
                    github_id: profile.id,
                    github_username: profile.username,
                    avatar: profile.photos?.[0]?.value
                },
                { autoCommit: true }
            );

            user = { user_id: newUserId, name: profile.displayName || profile.username, email };
        }

        await connection.close();

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        user.token = token;

        console.log('GitHub Auth Success:', profile.username);
        return done(null, user);
    } catch (error) {
        console.error('GitHub Auth Error:', error);
        return done(error, null);
    }
}));

export default passport;
