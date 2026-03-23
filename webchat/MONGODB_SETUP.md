# MongoDB Setup Options

You need MongoDB to store forum data. Choose one option:

## Option 1: MongoDB Atlas (Cloud - Easiest, No Installation)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Create a **FREE cluster** (M0)
4. Click **"Connect"**
5. Choose **"Connect your application"**
6. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
7. Create a file named `.env` in your project folder
8. Add this line:
   ```
   MONGODB_URI=your_connection_string_here
   ```
9. Install dotenv: `npm install dotenv`
10. Add to top of server.js: `require('dotenv').config();`

## Option 2: Install MongoDB Locally

1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. During installation, choose "Install as Windows Service"
4. MongoDB will start automatically
5. No changes needed - the forum will connect to localhost

## Option 3: Quick Test Without MongoDB

For testing, you can use an in-memory database:

1. Install: `npm install mongodb-memory-server`
2. The forum will work temporarily (data lost on restart)

---

**Recommended: Use Option 1 (MongoDB Atlas)** - it's free and easiest!

