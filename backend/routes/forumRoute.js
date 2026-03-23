// Forum Routes - with image upload support
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getThreads, getThread, createThread, addReply, upvoteThread, downvoteThread } from '../controllers/forumController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for forum image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../frontend/public/forum-uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, 'forum-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Images only! (JPG, PNG, GIF, WEBP)'));
        }
    }
});

// Thread routes
router.get('/threads', getThreads);
router.get('/threads/:id', getThread);
router.post('/threads', upload.array('images', 5), (req, res, next) => {
    // Attach image paths to body if uploaded (store as JSON array)
    if (req.files && req.files.length > 0) {
        const urls = req.files.map(f => '/forum-uploads/' + f.filename);
        req.body.image_url = JSON.stringify(urls);
    }
    next();
}, createThread);

// Reply routes
router.post('/threads/:id/reply', upload.array('images', 5), (req, res, next) => {
    if (req.files && req.files.length > 0) {
        const urls = req.files.map(f => '/forum-uploads/' + f.filename);
        req.body.image_url = JSON.stringify(urls);
    }
    next();
}, addReply);

// Voting routes
router.post('/threads/:id/upvote', upvoteThread);
router.post('/threads/:id/downvote', downvoteThread);

// Delete thread
router.delete('/threads/:id', async (req, res) => {
    try {
        const { Forum } = await import('../models/Forum.js');
        await Forum.deleteThread(req.params.id);
        res.json({ success: true, message: 'Thread deleted' });
    } catch (error) {
        console.error('Error deleting thread:', error);
        res.status(500).json({ success: false, message: 'Error deleting thread' });
    }
});

// Delete reply
router.delete('/threads/:threadId/reply/:replyId', async (req, res) => {
    try {
        const { Forum } = await import('../models/Forum.js');
        await Forum.deleteReply(req.params.replyId);
        res.json({ success: true, message: 'Reply deleted' });
    } catch (error) {
        console.error('Error deleting reply:', error);
        res.status(500).json({ success: false, message: 'Error deleting reply' });
    }
});

export default router;
