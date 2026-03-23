const mongoose = require('mongoose');

// Schema for storing call records
const callHistorySchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true
  },
  participants: [{
    userId: String,
    joinedAt: Date,
    leftAt: Date
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number // in seconds
});

module.exports = mongoose.model('CallHistory', callHistorySchema);
