// LearnHub Backend Server
// Node.js + Express + Oracle Database

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
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
import paymentRouter from './routes/paymentRoute.js';
import forumRouter from './routes/forumRoute.js';
import sessionRouter from './routes/sessionRoute.js';
import adminRouter from './routes/adminRoute.js';
import dashboardRouter from './routes/dashboardRoute.js';
import { Payment } from './models/Payment.js';
import { Forum } from './models/Forum.js';
import { LiveSession } from './models/LiveSession.js';
import { User } from './models/User.js';

import { Interaction } from './models/Interaction.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// Socket.IO for video meeting signaling
const io = new SocketIOServer(server, {
    cors: { origin: '*' }
});

// Connect to Oracle & init tables
connectOracle().then(async () => {
    try { await Payment.initTable(); } catch (e) { /* table may already exist */ }
    try { await Forum.initTables(); } catch (e) { /* tables may already exist */ }
    try { await LiveSession.initTable(); } catch (e) { /* table may already exist */ }
    try { await User.ensureRoleColumn(); } catch (e) { /* column may already exist */ }
    try { await User.ensureProfileImageColumn(); } catch (e) { /* column may already exist */ }
    try { await Interaction.initCommentsTable(); } catch (e) { /* table may already exist */ }
}).catch(() => { });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

// Session for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'learnhub-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in production with HTTPS
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
app.use('/api/payment', paymentRouter);
app.use('/api/forum', forumRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/admin', adminRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api', systemRouter);

// Serve uploaded files (avatars etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// ─── Socket.IO Video Meeting Signaling ────────────────────
const videoUsers = new Map();

io.on('connection', (socket) => {
    console.log('📹 Video user connected:', socket.id);

    socket.on('join-room', (roomId, userData) => {
        socket.join(roomId);
        videoUsers.set(socket.id, { roomId, userData });
        console.log(`📹 [JOIN] ${userData.name} (${userData.role}) joined room: "${roomId}" | socket: ${socket.id}`);
        // Log how many users are in this room
        const room = io.sockets.adapter.rooms.get(roomId);
        console.log(`📹 [ROOM] "${roomId}" now has ${room ? room.size : 0} user(s)`);
        socket.to(roomId).emit('user-connected', { ...userData, id: socket.id });
    });

    // WebRTC signaling — include sender's info so receiver can update UI
    socket.on('offer', (data) => {
        const senderInfo = videoUsers.get(socket.id);
        socket.to(data.to).emit('offer', {
            offer: data.offer,
            from: socket.id,
            userData: senderInfo?.userData || { name: 'Unknown', role: 'student' }
        });
    });
    socket.on('answer', (data) => {
        const senderInfo = videoUsers.get(socket.id);
        socket.to(data.to).emit('answer', {
            answer: data.answer,
            from: socket.id,
            userData: senderInfo?.userData || { name: 'Unknown', role: 'student' }
        });
    });
    socket.on('ice-candidate', (data) => {
        socket.to(data.to).emit('ice-candidate', { candidate: data.candidate, from: socket.id });
    });

    // Chat + file sharing
    socket.on('chat-message', (data) => socket.to(data.roomId).emit('chat-message', data));
    socket.on('chat-file', (data) => socket.to(data.roomId).emit('chat-file', data));

    // Media state & raise hand
    socket.on('media-state', (data) => socket.to(data.roomId).emit('media-state', data));
    socket.on('raise-hand', (data) => socket.to(data.roomId).emit('raise-hand', data));

    socket.on('disconnect', () => {
        const user = videoUsers.get(socket.id);
        if (user) {
            socket.to(user.roomId).emit('user-disconnected', user.userData);
            videoUsers.delete(socket.id);
        }
        console.log('📹 Video user disconnected:', socket.id);
    });
});

// Start server (http for Socket.IO)
server.listen(port, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 LEARNHUB API SERVER - Node.js + Oracle');
    console.log('='.repeat(60));
    console.log(`📍 Running on: http://localhost:${port}`);
    console.log(`📂 Backend: backend/`);
    console.log(`🎨 Frontend: frontend/`);
    console.log(`🔐 GitHub OAuth: /api/auth/github`);
    console.log(`💳 Payments: /api/payment/stripe/config`);
    console.log(`📹 Video Meeting: Socket.IO on same port`);
    console.log('='.repeat(60) + '\n');
});
