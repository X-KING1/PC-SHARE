// Session Controller - Live session time slot management
import { LiveSession } from '../models/LiveSession.js';

// Get sessions by mentor
export const getMentorSessions = async (req, res) => {
    try {
        const sessions = await LiveSession.findByMentor(req.params.userId);
        res.status(200).json({ message: 'Sessions fetched', data: sessions });
    } catch (error) {
        console.error('Get mentor sessions error:', error);
        res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
    }
};

// Get sessions for a course
export const getCourseSessions = async (req, res) => {
    try {
        const sessions = await LiveSession.findByCourse(req.params.courseId);
        res.status(200).json({ message: 'Sessions fetched', data: sessions });
    } catch (error) {
        console.error('Get course sessions error:', error);
        res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
    }
};

// Create new session slot
export const createSession = async (req, res) => {
    const { course_id, mentor_id, mentor_name, title, session_date, start_time, duration_minutes } = req.body;

    if (!course_id || !mentor_id || !title || !session_date || !start_time) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const result = await LiveSession.create({
            course_id, mentor_id, mentor_name, title, session_date, start_time, duration_minutes
        });
        res.status(201).json({ message: 'Session created', data: result });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ message: 'Failed to create session', error: error.message });
    }
};

// Student books a session
export const bookSession = async (req, res) => {
    const { student_id, student_name } = req.body;
    const { id } = req.params;

    if (!student_id) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    try {
        await LiveSession.book(id, student_id, student_name || 'Student');
        res.status(200).json({ message: 'Session booked successfully' });
    } catch (error) {
        console.error('Book session error:', error);
        res.status(500).json({ message: 'Failed to book session', error: error.message });
    }
};

// Mark session complete
export const completeSession = async (req, res) => {
    try {
        await LiveSession.complete(req.params.id);
        res.status(200).json({ message: 'Session marked complete' });
    } catch (error) {
        console.error('Complete session error:', error);
        res.status(500).json({ message: 'Failed to complete session', error: error.message });
    }
};

// Delete session
export const deleteSession = async (req, res) => {
    try {
        await LiveSession.remove(req.params.id);
        res.status(200).json({ message: 'Session deleted' });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ message: 'Failed to delete session', error: error.message });
    }
};
