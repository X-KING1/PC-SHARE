const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const CallHistory = require('./models/CallHistory');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.use(express.static('../client'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/videocall', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Store active users and rooms
const users = new Map();
const activeRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (roomId, userData) => {
    socket.join(roomId);
    users.set(socket.id, { roomId, userData });
    
    // Create or update room in database (optional - won't crash if MongoDB is down)
    try {
      if (!activeRooms.has(roomId)) {
        const callRecord = new CallHistory({
          roomId: roomId,
          participants: [{
            userId: userData.id,
            joinedAt: new Date()
          }]
        });
        await callRecord.save();
        activeRooms.set(roomId, callRecord._id);
      } else {
        // Add participant to existing call
        const callId = activeRooms.get(roomId);
        await CallHistory.findByIdAndUpdate(callId, {
          $push: {
            participants: {
              userId: userData.id,
              joinedAt: new Date()
            }
          }
        });
      }
    } catch (error) {
      console.log('MongoDB not available, continuing without saving history');
    }
    
    socket.to(roomId).emit('user-connected', userData);
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    socket.to(data.to).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.to).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.to).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // Chat messages
  socket.on('chat-message', (data) => {
    socket.to(data.roomId).emit('chat-message', data);
  });

  // File sharing
  socket.on('chat-file', (data) => {
    socket.to(data.roomId).emit('chat-file', data);
  });

  // Media state (mute/video)
  socket.on('media-state', (data) => {
    socket.to(data.roomId).emit('media-state', data);
  });

  // Raise hand
  socket.on('raise-hand', (data) => {
    socket.to(data.roomId).emit('raise-hand', data);
  });

  socket.on('disconnect', async () => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.roomId).emit('user-disconnected', user.userData);
      
      // Update database with leave time (optional)
      try {
        const callId = activeRooms.get(user.roomId);
        if (callId) {
          const call = await CallHistory.findById(callId);
          const participant = call.participants.find(p => p.userId === user.userData.id);
          if (participant) {
            participant.leftAt = new Date();
            await call.save();
          }
          
          // If room is empty, calculate duration and close it
          const roomSockets = await io.in(user.roomId).fetchSockets();
          if (roomSockets.length === 0) {
            call.endTime = new Date();
            call.duration = Math.floor((call.endTime - call.startTime) / 1000);
            await call.save();
            activeRooms.delete(user.roomId);
          }
        }
      } catch (error) {
        console.log('MongoDB not available for saving disconnect');
      }
      
      users.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
