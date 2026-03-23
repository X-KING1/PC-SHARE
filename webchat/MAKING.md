# Forum Application - Reuse Guide

## Files to Copy When Using This Forum in Another Project

If you want to use this forum code in another project, copy these files and folders:

### **Core Forum Files (Required)**

```
📁 models/
   └── Thread.js          # Database schema for threads and replies

📁 routes/
   └── threads.js         # All forum routes (create, view, vote, reply)

📁 views/
   ├── index.ejs          # Forum home page (list of threads)
   ├── thread.ejs         # Single thread view with comments
   └── new.ejs            # Create new thread form

📁 public/
   └── uploads/           # Folder for uploaded images (create if not exists)

📄 server.js              # Main server file (you'll need to integrate this)
📄 package.json           # Dependencies list
```

### **Dependencies Required**

From `package.json`, you need these packages:

```json
{
  "dependencies": {
    "ejs": "^3.1.9",
    "express": "^4.18.2",
    "express-session": "^1.18.2",
    "method-override": "^3.0.0",
    "mongoose": "^8.0.0",
    "multer": "^2.0.2"
  }
}
```

Install with:
```bash
npm install ejs express express-session method-override mongoose multer
```

### **Integration Steps**

1. **Copy the files** listed above to your new project

2. **Update your main server file** with these configurations:

```javascript
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

// Connect to MongoDB
const mongoURI = 'YOUR_MONGODB_CONNECTION_STRING';
mongoose.connect(mongoURI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('Error connecting to MongoDB:', err);
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(methodOverride('_method'));

// Session middleware
app.use(session({
    secret: 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Middleware to set current user in session
app.use((req, res, next) => {
    res.locals.currentUser = req.session.username || null;
    next();
});

// Forum Routes
const threadRoutes = require('./routes/threads');
app.use('/', threadRoutes(upload));

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

3. **Create the uploads folder**:
```bash
mkdir -p public/uploads
```

4. **Update MongoDB connection string** in your server file

5. **Run the project**:
```bash
npm install
node server.js
```

### **Optional: Mount Forum on a Subpath**

If you want the forum at `/forum` instead of root `/`:

In your main server file:
```javascript
app.use('/forum', threadRoutes(upload));
```

Then update routes in `routes/threads.js` to use relative paths or update redirects accordingly.

---

## How to Add Login-Based Authentication & Delete Functionality

If you want to add proper user authentication and allow users to delete their own posts/comments in the future, follow these steps:

---

## 1. Install Required Packages

```bash
npm install bcryptjs express-session connect-mongo
```

- `bcryptjs` - For password hashing
- `express-session` - Already installed, for session management
- `connect-mongo` - To store sessions in MongoDB (optional but recommended)

---

## 2. Create User Model

Create `models/User.js`:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

---

## 3. Update Session Configuration in `server.js`

Replace the session middleware section with:

```javascript
const MongoStore = require('connect-mongo');

// Session middleware with MongoDB store
app.use(session({
    secret: 'forum-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoURI,
        touchAfter: 24 * 3600 // lazy session update
    }),
    cookie: { 
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: false // set to true in production with HTTPS
    }
}));

// Middleware to set current user
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});
```

---

## 4. Create Authentication Routes

Create `routes/auth.js`:

```javascript
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Show register form
router.get('/register', (req, res) => {
    res.render('register');
});

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        req.session.user = { username: user.username, id: user._id };
        res.redirect('/');
    } catch (err) {
        res.status(400).send('Username already exists or invalid data');
    }
});

// Show login form
router.get('/login', (req, res) => {
    res.render('login');
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send('Invalid username or password');
        }
        req.session.user = { username: user.username, id: user._id };
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
```

Add to `server.js`:
```javascript
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);
```

---

## 5. Create Middleware for Authentication

Create `middleware/auth.js`:

```javascript
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

module.exports = { isAuthenticated };
```

---

## 6. Update Thread Routes to Use Authentication

In `routes/threads.js`, add at the top:

```javascript
const { isAuthenticated } = require('../middleware/auth');
```

Update routes:

```javascript
// Protect routes that require login
router.get('/new', isAuthenticated, (req, res) => {
    res.render('new');
});

router.post('/threads', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const thread = new Thread({
            title: req.body.title,
            author: req.session.user.username, // Use logged-in user
            content: req.body.content,
            image: req.file ? '/uploads/' + req.file.filename : null
        });
        await thread.save();
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Error creating thread');
    }
});

router.post('/threads/:id/reply', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        thread.replies.push({
            author: req.session.user.username, // Use logged-in user
            content: req.body.content,
            image: req.file ? '/uploads/' + req.file.filename : null
        });
        await thread.save();
        res.redirect('/threads/' + req.params.id);
    } catch (err) {
        res.status(500).send('Error adding reply');
    }
});
```

---


