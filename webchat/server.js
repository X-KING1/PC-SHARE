const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const multer = require('multer');
const path = require('path');
const session = require('express-session');

const app = express();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// Connect to MongoDB Atlas
const mongoURI = 'mongodb+srv://sujansub9_db_user:rWVG0sSE7mePejsK@cluster0.eu72szc.mongodb.net/forum?retryWrites=true&w=majority';

mongoose.connect(mongoURI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('MongoDB not running. Install MongoDB or use MongoDB Atlas.');
    console.log('For now, the app will start but database features won\'t work.');
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(methodOverride('_method'));

// Session middleware
app.use(session({
    secret: 'forum-secret-key-change-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Middleware to set current user in session
app.use((req, res, next) => {
    res.locals.currentUser = req.session.username || null;
    next();
});

// Routes
const threadRoutes = require('./routes/threads');
app.use('/', threadRoutes(upload));

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Forum running on http://localhost:${PORT}`);
});

