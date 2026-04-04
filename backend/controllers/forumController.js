// Forum Controller - handles forum thread and reply operations
import { Forum } from '../models/Forum.js';

// GET /api/forum/threads - List all threads
export const getThreads = async (req, res) => {
    try {
        const threads = await Forum.getAllThreads();
        res.json({ success: true, data: threads });
    } catch (error) {
        console.error('Error fetching threads:', error);
        res.status(500).json({ success: false, message: 'Error fetching threads' });
    }
};

// GET /api/forum/threads/:id - Get single thread with replies
export const getThread = async (req, res) => {
    try {
        const thread = await Forum.getThread(req.params.id);
        if (!thread) {
            return res.status(404).json({ success: false, message: 'Thread not found' });
        }
        res.json({ success: true, data: thread });
    } catch (error) {
        console.error('Error fetching thread:', error);
        res.status(500).json({ success: false, message: 'Error fetching thread' });
    }
};

// POST /api/forum/threads - Create new thread
export const createThread = async (req, res) => {
    try {
        const { title, content, author, user_id, image_url } = req.body;
        if (!title || !content || !author) {
            return res.status(400).json({ success: false, message: 'Title, content, and author are required' });
        }
        const threadId = await Forum.createThread({ title, content, author, user_id, image_url });
        res.status(201).json({ success: true, data: { thread_id: threadId }, message: 'Thread created' });
    } catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({ success: false, message: 'Error creating thread' });
    }
};

// POST /api/forum/threads/:id/reply - Add reply
export const addReply = async (req, res) => {
    try {
        const { content, author, user_id, image_url } = req.body;
        if (!content || !author) {
            return res.status(400).json({ success: false, message: 'Content and author are required' });
        }
        const replyId = await Forum.addReply(req.params.id, { content, author, user_id, image_url });
        res.status(201).json({ success: true, data: { reply_id: replyId }, message: 'Reply added' });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ success: false, message: 'Error adding reply' });
    }
};

// POST /api/forum/threads/:id/vote - Vote on thread (one per user)
export const voteThread = async (req, res) => {
    try {
        const { user_id, vote_type } = req.body;
        if (!user_id || !vote_type) {
            return res.status(400).json({ success: false, message: 'user_id and vote_type required' });
        }
        const result = await Forum.vote(req.params.id, user_id, vote_type);
        const score = result.UPVOTES - result.DOWNVOTES;
        res.json({ success: true, score, upvotes: result.UPVOTES, downvotes: result.DOWNVOTES, userVote: result.userVote });
    } catch (error) {
        console.error('Error voting:', error);
        res.status(500).json({ success: false, message: 'Error voting' });
    }
};

// GET /api/forum/votes/:userId - Get user's votes
export const getUserVotes = async (req, res) => {
    try {
        const votes = await Forum.getUserVotes(req.params.userId);
        const voteMap = {};
        votes.forEach(v => { voteMap[v.THREAD_ID] = v.VOTE_TYPE; });
        res.json({ success: true, data: voteMap });
    } catch (error) {
        console.error('Error fetching votes:', error);
        res.status(500).json({ success: false, message: 'Error fetching votes' });
    }
};
