const express = require('express');
const Thread = require('../models/Thread');

module.exports = function(upload) {
    const router = express.Router();

// Home page - show all threads
router.get('/', async (req, res) => {
    try {
        const threads = await Thread.find();
        // Sort by vote score (upvotes - downvotes) in descending order
        threads.sort((a, b) => {
            const scoreA = a.upvotes - a.downvotes;
            const scoreB = b.upvotes - b.downvotes;
            return scoreB - scoreA;
        });
        res.render('index', { threads });
    } catch (err) {
        res.status(500).send('Error loading threads');
    }
});

// Show form to create new thread
router.get('/new', (req, res) => {
    res.render('new');
});

// Create new thread
router.post('/threads', upload.single('image'), async (req, res) => {
    try {
        const thread = new Thread({
            title: req.body.title,
            author: req.body.author,
            content: req.body.content,
            image: req.file ? '/uploads/' + req.file.filename : null
        });
        await thread.save();
        // Save username in session
        req.session.username = req.body.author;
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Error creating thread');
    }
});

// View single thread with replies
router.get('/threads/:id', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        res.render('thread', { thread });
    } catch (err) {
        res.status(500).send('Error loading thread');
    }
});

// Add reply to thread
router.post('/threads/:id/reply', upload.single('image'), async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        thread.replies.push({
            author: req.body.author,
            content: req.body.content,
            image: req.file ? '/uploads/' + req.file.filename : null
        });
        await thread.save();
        // Save username in session
        req.session.username = req.body.author;
        res.redirect('/threads/' + req.params.id);
    } catch (err) {
        res.status(500).send('Error adding reply');
    }
});



// Upvote thread
router.post('/threads/:id/upvote', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        thread.upvotes += 1;
        await thread.save();
        const score = thread.upvotes - thread.downvotes;
        res.json({ success: true, score });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error voting' });
    }
});

// Downvote thread
router.post('/threads/:id/downvote', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        thread.downvotes += 1;
        await thread.save();
        const score = thread.upvotes - thread.downvotes;
        res.json({ success: true, score });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error voting' });
    }
});



    return router;
};

