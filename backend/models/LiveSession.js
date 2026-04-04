// LiveSession Model - Oracle DB operations for video meeting time slots
import { getConnection } from '../config/oracle.js';

export const LiveSession = {
    // Create table if not exists
    initTable: async () => {
        const connection = await getConnection();
        try {
            // Check if table exists
            const check = await connection.execute(
                `SELECT COUNT(*) FROM user_tables WHERE table_name = 'LIVE_SESSIONS'`
            );
            if (check.rows[0][0] === 0) {
                await connection.execute(`
                    CREATE TABLE live_sessions (
                        session_id NUMBER PRIMARY KEY,
                        course_id NUMBER,
                        mentor_id NUMBER,
                        mentor_name VARCHAR2(200),
                        title VARCHAR2(300),
                        session_date VARCHAR2(20),
                        start_time VARCHAR2(20),
                        duration_minutes NUMBER DEFAULT 30,
                        status VARCHAR2(20) DEFAULT 'available',
                        student_id NUMBER,
                        student_name VARCHAR2(200),
                        room_id VARCHAR2(100),
                        created_date DATE DEFAULT SYSDATE
                    )
                `);
                await connection.execute('COMMIT');
                console.log('✅ LIVE_SESSIONS table created');
            }
        } finally {
            await connection.close();
        }
    },

    // Get next ID
    getNextId: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute('SELECT NVL(MAX(session_id), 0) + 1 FROM live_sessions');
            return result.rows[0][0];
        } finally {
            await connection.close();
        }
    },

    // Create a new session slot
    create: async (data) => {
        const connection = await getConnection();
        try {
            const id = await LiveSession.getNextId();
            const roomId = `room_${data.course_id}_${id}_${Date.now()}`;
            await connection.execute(
                `INSERT INTO live_sessions (session_id, course_id, mentor_id, mentor_name, title, session_date, start_time, duration_minutes, status, room_id, created_date)
                 VALUES (:id, :course_id, :mentor_id, :mentor_name, :title, :session_date, :start_time, :duration, 'available', :room_id, SYSDATE)`,
                {
                    id,
                    course_id: data.course_id,
                    mentor_id: data.mentor_id,
                    mentor_name: data.mentor_name || 'Mentor',
                    title: data.title,
                    session_date: data.session_date,
                    start_time: data.start_time,
                    duration: data.duration_minutes || 30,
                    room_id: roomId
                },
                { autoCommit: true }
            );
            return { session_id: id, room_id: roomId };
        } finally {
            await connection.close();
        }
    },

    // Find sessions by mentor
    findByMentor: async (mentorId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT session_id, course_id, mentor_id, mentor_name, title, session_date, start_time, duration_minutes, status, student_id, student_name, room_id, created_date
                 FROM live_sessions WHERE mentor_id = :mentorId ORDER BY session_date DESC, start_time DESC`,
                { mentorId }
            );
            const columns = ['session_id', 'course_id', 'mentor_id', 'mentor_name', 'title', 'session_date', 'start_time', 'duration_minutes', 'status', 'student_id', 'student_name', 'room_id', 'created_date'];
            return result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });
        } finally {
            await connection.close();
        }
    },

    // Find available sessions for a course
    findByCourse: async (courseId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT session_id, course_id, mentor_id, mentor_name, title, session_date, start_time, duration_minutes, status, student_id, student_name, room_id, created_date
                 FROM live_sessions WHERE course_id = :courseId ORDER BY session_date ASC, start_time ASC`,
                { courseId }
            );
            const columns = ['session_id', 'course_id', 'mentor_id', 'mentor_name', 'title', 'session_date', 'start_time', 'duration_minutes', 'status', 'student_id', 'student_name', 'room_id', 'created_date'];
            return result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });
        } finally {
            await connection.close();
        }
    },

    // Student books a session
    book: async (sessionId, studentId, studentName) => {
        const connection = await getConnection();
        try {
            await connection.execute(
                `UPDATE live_sessions SET status = 'booked', student_id = :studentId, student_name = :studentName WHERE session_id = :sessionId AND status = 'available'`,
                { studentId, studentName, sessionId },
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }
    },

    // Mark session as completed
    complete: async (sessionId) => {
        const connection = await getConnection();
        try {
            await connection.execute(
                `UPDATE live_sessions SET status = 'completed' WHERE session_id = :sessionId`,
                { sessionId },
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }
    },

    // Update session details (only if not completed)
    update: async (sessionId, data) => {
        const connection = await getConnection();
        try {
            const fields = [];
            const params = { sessionId };
            if (data.title) { fields.push('title = :title'); params.title = data.title; }
            if (data.session_date) { fields.push('session_date = :session_date'); params.session_date = data.session_date; }
            if (data.start_time) { fields.push('start_time = :start_time'); params.start_time = data.start_time; }
            if (data.duration_minutes) { fields.push('duration_minutes = :duration'); params.duration = data.duration_minutes; }
            if (data.course_id) { fields.push('course_id = :course_id'); params.course_id = data.course_id; }
            if (fields.length === 0) return;
            await connection.execute(
                `UPDATE live_sessions SET ${fields.join(', ')} WHERE session_id = :sessionId AND status != 'completed'`,
                params,
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }
    },

    // Delete a session
    remove: async (sessionId) => {
        const connection = await getConnection();
        try {
            await connection.execute(
                `DELETE FROM live_sessions WHERE session_id = :sessionId`,
                { sessionId },
                { autoCommit: true }
            );
        } finally {
            await connection.close();
        }
    }
};
