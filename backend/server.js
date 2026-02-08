// LearnHub Backend Server
// Node.js + Express + Oracle Database

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

import connectOracle from './config/oracle.js';
import passport from './config/passport.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoute.js';
import quizRouter from './routes/quizRoute.js';
import systemRouter from './routes/systemRoute.js';
import recommendationRouter from './routes/recommendationRoute.js';
import authRouter from './routes/authRoute.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Connect to Oracle
connectOracle();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Session for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'learnhub-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set true in production with HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/courses', courseRouter);
app.use('/api/users', userRouter);
app.use('/api/quizzes', quizRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/auth', authRouter);
app.use('/api', systemRouter);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Frontend routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('*', (req, res) => {
    // Try to serve the file, otherwise send index.html
    const filePath = path.join(__dirname, '../frontend', req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        }
    });
});

// Start server
app.listen(port, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 LEARNHUB API SERVER - Node.js + Oracle');
    console.log('='.repeat(60));
    console.log(`📍 Running on: http://localhost:${port}`);
    console.log(`📂 Backend: backend/`);
    console.log(`🎨 Frontend: frontend/`);
    console.log(`🔐 GitHub OAuth: /api/auth/github`);
    console.log('='.repeat(60) + '\n');
});
