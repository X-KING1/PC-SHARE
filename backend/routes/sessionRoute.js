// Session Routes - Live video meeting time slots
import express from 'express';
import {
    getMentorSessions,
    getCourseSessions,
    createSession,
    bookSession,
    completeSession,
    deleteSession
} from '../controllers/sessionController.js';

const router = express.Router();

// Mentor gets their sessions
router.get('/mentor/:userId', getMentorSessions);

// Get sessions for a course (student view)
router.get('/course/:courseId', getCourseSessions);

// Create new session slot
router.post('/', createSession);

// Book a session
router.put('/:id/book', bookSession);

// Complete a session
router.put('/:id/complete', completeSession);

// Delete a session
router.delete('/:id', deleteSession);

export default router;
