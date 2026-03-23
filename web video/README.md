# WebRTC Video Call Application

A simple 1-on-1 video calling application built with WebRTC, Socket.io, and MongoDB for mentor-student sessions.

## Features

- 🎥 Real-time video and audio calling
- 💬 Text chat with file/image sharing
- 🖥️ Screen sharing
- ✋ Raise hand feature
- ⏺️ Video recording
- 👥 Participant list
- 📎 File attachments
- 🔔 Chat notifications

## Technologies Used

- **Frontend**: HTML, Tailwind CSS, JavaScript
- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.io, WebRTC
- **Database**: MongoDB

## Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- Modern web browser (Chrome, Firefox, Edge)

## Installation

### 1. Clone or Download the Project

```bash
cd your-project-folder
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

This will install:
- express
- socket.io
- mongoose
- cors

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
mongod
```

Or start MongoDB service on Windows:
```bash
net start MongoDB
```

### 4. Start the Server

```bash
cd server
node server.js
```

You should see:
```
Server running on port 3000
MongoDB connected
```

### 5. Open the Application

Open your browser and go to:
```
http://localhost:3000
```

## How to Use

### Starting a Video Call

1. **First User (Student)**:
   - Enter your name (e.g., "John")
   - Select role: "Student"
   - Enter a room ID (e.g., "room123")
   - Click "Join"
   - Allow camera and microphone access

2. **Second User (Mentor)**:
   - Open another browser tab or window
   - Enter your name (e.g., "Sarah")
   - Select role: "Mentor"
   - Enter the **same room ID** (e.g., "room123")
   - Click "Join"
   - Allow camera and microphone access

3. Both users will now be connected!

### Using Features

- **Mute/Unmute**: Click the microphone button
- **Stop/Start Video**: Click the camera button
- **Chat**: Click "Chat" button to open chat panel
- **Send Files**: Click 📎 button to attach images or documents
- **Share Screen**: Click "Share Screen" to share your screen
- **Raise Hand**: Click "Reactions" button
- **Record**: Click "Record" to save the video call
- **End Call**: Click red "End" button

## Project Structure

```
project/
├── client/
│   ├── index.html          # Main HTML file
│   ├── app.js              # Frontend JavaScript
│   └── style.css           # Custom styles (minimal)
├── server/
│   ├── server.js           # Express + Socket.io server
│   ├── package.json        # Dependencies
│   └── models/
│       └── CallHistory.js  # MongoDB schema
└── README.md               # This file
```

## How It Works

### WebRTC Connection Flow

1. **User A joins** → Gets camera/mic → Tells server "I'm in room123"
2. **User B joins** → Gets camera/mic → Tells server "I'm in room123"
3. **Server tells User A**: "User B joined!"
4. **User A creates offer** → Sends to User B via server
5. **User B creates answer** → Sends to User A via server
6. **ICE candidates exchanged** → Direct peer-to-peer connection established
7. **Video/audio flows** directly between User A and User B

### Key Concepts

- **STUN Server**: Helps find your public IP address (using Google's free STUN)
- **Signaling**: Socket.io handles the initial connection setup
- **Peer Connection**: WebRTC handles the actual video/audio streaming
- **MongoDB**: Stores call history and session data

## Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions
- Make sure no other app is using the camera
- Try a different browser

### Users Can't Connect
- Make sure both users use the **exact same room ID**
- Check if server is running
- Check browser console for errors (F12)

### MongoDB Errors
- Make sure MongoDB is running
- Check connection string in `server/server.js`
- The app will work without MongoDB (history won't be saved)

## Configuration

### Change Server Port

Edit `server/server.js`:
```javascript
const PORT = process.env.PORT || 3000;  // Change 3000 to your port
```

Also update `client/app.js`:
```javascript
const socket = io('http://localhost:3000');  // Change port here too
```

### Change MongoDB Connection

Edit `server/server.js`:
```javascript
mongoose.connect('mongodb://localhost:27017/videocall', {
  // Your MongoDB connection string
});
```

## Deployment

### Deploy to Heroku/Render

1. Add `Procfile`:
```
web: node server/server.js
```

2. Set environment variables:
```
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=3000
```

3. Update Socket.io connection in `client/app.js`:
```javascript
const socket = io('https://your-app-name.herokuapp.com');
```

## Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari (iOS 11+)
- ❌ Internet Explorer (not supported)

## Known Limitations

- Only supports 1-on-1 calls (not group calls)
- Recording saves as .webm format
- File sharing limited to browser memory
- No end-to-end encryption (use HTTPS in production)

## Future Enhancements

- [ ] Group video calls (3+ people)
- [ ] Virtual backgrounds
- [ ] Noise cancellation
- [ ] Breakout rooms
- [ ] Whiteboard feature
- [ ] Calendar integration

## License

This project is for educational purposes.

## Credits

Built using:
- WebRTC API
- Socket.io
- MongoDB
- Tailwind CSS
- Express.js

---

**For questions or issues, check the browser console (F12) for error messages.**
