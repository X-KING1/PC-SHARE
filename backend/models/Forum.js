// Forum Model - Oracle DB forum operations
// Reddit-style threads + replies with voting
import { getConnection } from '../config/oracle.js';
import oracledb from 'oracledb';

export const Forum = {
    // Create tables if not exist
    initTables: async () => {
        const connection = await getConnection();
        try {
            // FORUM_THREADS table
            const check1 = await connection.execute(
                `SELECT COUNT(*) FROM user_tables WHERE table_name = 'FORUM_THREADS'`
            );
            if (check1.rows[0][0] === 0) {
                await connection.execute(`
                    CREATE TABLE forum_threads (
                        thread_id     NUMBER PRIMARY KEY,
                        user_id       NUMBER,
                        author        VARCHAR2(100) NOT NULL,
                        title         VARCHAR2(500) NOT NULL,
                        content       CLOB NOT NULL,
                        image_url     VARCHAR2(500),
                        upvotes       NUMBER DEFAULT 0,
                        downvotes     NUMBER DEFAULT 0,
                        created_date  TIMESTAMP DEFAULT SYSTIMESTAMP
                    )
                `);
                await connection.execute('COMMIT');
                console.log('✓ Forum threads table created');
            }

            // FORUM_REPLIES table
            const check2 = await connection.execute(
                `SELECT COUNT(*) FROM user_tables WHERE table_name = 'FORUM_REPLIES'`
            );
            if (check2.rows[0][0] === 0) {
                await connection.execute(`
                    CREATE TABLE forum_replies (
                        reply_id      NUMBER PRIMARY KEY,
                        thread_id     NUMBER NOT NULL,
                        user_id       NUMBER,
                        author        VARCHAR2(100) NOT NULL,
                        content       CLOB NOT NULL,
                        image_url     VARCHAR2(500),
                        created_date  TIMESTAMP DEFAULT SYSTIMESTAMP
                    )
                `);
                await connection.execute('COMMIT');
                console.log('✓ Forum replies table created');
            }
        } finally {
            await connection.close();
        }

        // FORUM_VOTES table for per-user vote tracking
        const conn2 = await getConnection();
        try {
            const check3 = await conn2.execute(
                `SELECT COUNT(*) FROM user_tables WHERE table_name = 'FORUM_VOTES'`
            );
            if (check3.rows[0][0] === 0) {
                await conn2.execute(`
                    CREATE TABLE forum_votes (
                        vote_id       NUMBER PRIMARY KEY,
                        thread_id     NUMBER NOT NULL,
                        user_id       NUMBER NOT NULL,
                        vote_type     VARCHAR2(10) NOT NULL,
                        created_date  TIMESTAMP DEFAULT SYSTIMESTAMP,
                        CONSTRAINT uq_forum_vote UNIQUE (thread_id, user_id)
                    )
                `);
                await conn2.execute('COMMIT');
                console.log('✓ Forum votes table created');
            }
        } finally {
            await conn2.close();
        }
    },

    // Get all threads sorted by vote score
    getAllThreads: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT t.thread_id, t.user_id, t.author, t.title, t.content, t.image_url,
                        t.upvotes, t.downvotes, t.created_date,
                        (SELECT COUNT(*) FROM forum_replies r WHERE r.thread_id = t.thread_id) AS reply_count
                 FROM forum_threads t
                 ORDER BY (t.upvotes - t.downvotes) DESC, t.created_date DESC`,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT } // OBJECT format
            );
            return result.rows;
        } finally {
            await connection.close();
        }
    },

    // Get single thread with replies
    getThread: async (threadId) => {
        const connection = await getConnection();
        try {
            // Get thread
            const threadResult = await connection.execute(
                `SELECT thread_id, user_id, author, title, content, image_url,
                        upvotes, downvotes, created_date
                 FROM forum_threads WHERE thread_id = :id`,
                { id: threadId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            if (threadResult.rows.length === 0) return null;

            const thread = threadResult.rows[0];

            // Get replies
            const repliesResult = await connection.execute(
                `SELECT reply_id, thread_id, user_id, author, content, image_url, created_date
                 FROM forum_replies WHERE thread_id = :id ORDER BY created_date ASC`,
                { id: threadId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            thread.replies = repliesResult.rows;
            return thread;
        } finally {
            await connection.close();
        }
    },

    // Create new thread
    createThread: async (data) => {
        const connection = await getConnection();
        try {
            const idResult = await connection.execute('SELECT NVL(MAX(thread_id), 0) + 1 FROM forum_threads');
            const threadId = idResult.rows[0][0];

            await connection.execute(
                `INSERT INTO forum_threads (thread_id, user_id, author, title, content, image_url, created_date)
                 VALUES (:thread_id, :user_id, :author, :title, :content, :image_url, SYSTIMESTAMP)`,
                {
                    thread_id: threadId,
                    user_id: data.user_id || null,
                    author: data.author,
                    title: data.title,
                    content: data.content,
                    image_url: data.image_url || null
                },
                { autoCommit: true }
            );
            return threadId;
        } finally {
            await connection.close();
        }
    },

    // Add reply to thread
    addReply: async (threadId, data) => {
        const connection = await getConnection();
        try {
            const idResult = await connection.execute('SELECT NVL(MAX(reply_id), 0) + 1 FROM forum_replies');
            const replyId = idResult.rows[0][0];

            await connection.execute(
                `INSERT INTO forum_replies (reply_id, thread_id, user_id, author, content, image_url, created_date)
                 VALUES (:reply_id, :thread_id, :user_id, :author, :content, :image_url, SYSTIMESTAMP)`,
                {
                    reply_id: replyId,
                    thread_id: threadId,
                    user_id: data.user_id || null,
                    author: data.author,
                    content: data.content,
                    image_url: data.image_url || null
                },
                { autoCommit: true }
            );
            return replyId;
        } finally {
            await connection.close();
        }
    },

    // Vote on thread (one vote per user, switch only - no unvoting)
    vote: async (threadId, userId, voteType) => {
        const connection = await getConnection();
        try {
            // Check existing vote
            const existing = await connection.execute(
                `SELECT vote_id, vote_type FROM forum_votes WHERE thread_id = :threadid AND user_id = :userid`,
                { threadid: threadId, userid: userId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (existing.rows.length > 0) {
                const currentVote = existing.rows[0].VOTE_TYPE;
                if (currentVote === voteType) {
                    // Same vote — do nothing (already voted this way)
                    const result = await connection.execute(
                        `SELECT upvotes, downvotes FROM forum_threads WHERE thread_id = :id`,
                        { id: threadId },
                        { outFormat: oracledb.OUT_FORMAT_OBJECT }
                    );
                    return { ...result.rows[0], userVote: currentVote };
                } else {
                    // Different vote — switch
                    await connection.execute(
                        `UPDATE forum_votes SET vote_type = :votetype WHERE thread_id = :threadid AND user_id = :userid`,
                        { votetype: voteType, threadid: threadId, userid: userId }
                    );
                    const oldCol = currentVote === 'up' ? 'upvotes' : 'downvotes';
                    const newCol = voteType === 'up' ? 'upvotes' : 'downvotes';
                    await connection.execute(
                        `UPDATE forum_threads SET ${oldCol} = GREATEST(${oldCol} - 1, 0), ${newCol} = ${newCol} + 1 WHERE thread_id = :id`,
                        { id: threadId }
                    );
                }
            } else {
                // New vote
                const idResult = await connection.execute('SELECT NVL(MAX(vote_id), 0) + 1 FROM forum_votes');
                const voteId = idResult.rows[0][0];
                await connection.execute(
                    `INSERT INTO forum_votes (vote_id, thread_id, user_id, vote_type) VALUES (:voteid, :threadid, :userid, :votetype)`,
                    { voteid: voteId, threadid: threadId, userid: userId, votetype: voteType }
                );
                const col = voteType === 'up' ? 'upvotes' : 'downvotes';
                await connection.execute(
                    `UPDATE forum_threads SET ${col} = ${col} + 1 WHERE thread_id = :id`,
                    { id: threadId }
                );
            }

            await connection.execute('COMMIT');

            const result = await connection.execute(
                `SELECT upvotes, downvotes FROM forum_threads WHERE thread_id = :id`,
                { id: threadId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            return { ...result.rows[0], userVote: voteType };
        } finally {
            await connection.close();
        }
    },

    // Get user's votes for all threads
    getUserVotes: async (userId) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT thread_id, vote_type FROM forum_votes WHERE user_id = :userid`,
                { userid: userId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            return result.rows;
        } finally {
            await connection.close();
        }
    },

    // Delete thread and its replies
    deleteThread: async (threadId) => {
        const connection = await getConnection();
        try {
            await connection.execute('DELETE FROM forum_replies WHERE thread_id = :id', { id: threadId }, { autoCommit: true });
            await connection.execute('DELETE FROM forum_threads WHERE thread_id = :id', { id: threadId }, { autoCommit: true });
        } finally {
            await connection.close();
        }
    },

    // Delete a reply
    deleteReply: async (replyId) => {
        const connection = await getConnection();
        try {
            await connection.execute('DELETE FROM forum_replies WHERE reply_id = :id', { id: replyId }, { autoCommit: true });
        } finally {
            await connection.close();
        }
    }
};
