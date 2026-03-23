# Setup Guide for Simple Forum

## Step 1: Install Node.js

1. Go to: https://nodejs.org/
2. Download the LTS version (recommended)
3. Run the installer
4. Restart your computer

## Step 2: Install MongoDB

**Option A: MongoDB Community Server (Local)**
1. Go to: https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server
3. Install it
4. MongoDB will run automatically

**Option B: Use MongoDB Atlas (Cloud - Easier)**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a free cluster
4. Get connection string
5. Update `server.js` line 7 with your connection string

## Step 3: Install Dependencies

Open terminal in this folder and run:
```
npm install
```

## Step 4: Start the Forum

```
npm start
```

## Step 5: Open in Browser

Go to: http://localhost:3000

---

## Quick Test (After Setup)

1. Click "Create New Thread"
2. Enter your name, title, and content
3. Click "Post Thread"
4. Click on the thread to view it
5. Add a reply
6. Done!

---

## Troubleshooting

**MongoDB connection error?**
- Make sure MongoDB is running
- Or use MongoDB Atlas cloud version

**Port 3000 already in use?**
- Change PORT in server.js to 3001 or another number

**npm not found?**
- Install Node.js first
- Restart terminal after installing

