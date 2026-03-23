// Step 1: Connect to our server using Socket.io
const socket = io('http://localhost:3000');

// Step 2: Get all the buttons and elements from HTML
const joinSection = document.getElementById('joinSection');
const mainContent = document.getElementById('mainContent');
const userNameInput = document.getElementById('userName');
const userRoleSelect = document.getElementById('userRole');
const roomIdInput = document.getElementById('roomId');
const joinBtn = document.getElementById('joinBtn');
const muteBtn = document.getElementById('muteBtn');
const videoBtn = document.getElementById('videoBtn');
const screenShareBtn = document.getElementById('screenShareBtn');
const raiseHandBtn = document.getElementById('raiseHandBtn');
const recordBtn = document.getElementById('recordBtn');
const hangupBtn = document.getElementById('hangupBtn');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatMessages = document.getElementById('chatMessages');
const attachBtn = document.getElementById('attachBtn');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const removeFile = document.getElementById('removeFile');
const participantList = document.getElementById('participantList');
const timerDisplay = document.getElementById('timerDisplay');
const sidePanel = document.getElementById('sidePanel');
const toggleChatBtn = document.getElementById('toggleChatBtn2');
const toggleParticipantsBtn = document.getElementById('toggleParticipantsBtn2');
const chatTab = document.getElementById('chatTab');
const participantsTab = document.getElementById('participantsTab');
const chatContent = document.getElementById('chatContent');
const participantsContent = document.getElementById('participantsContent');

// Step 3: Declare variables to store our data
let localStream;  // My camera and microphone
let remoteStream;  // Other person's camera and microphone
let peerConnection;  // WebRTC connection between two people
let screenStream;  // For screen sharing
let roomId;  // Meeting room ID
let userName;  // My name
let userRole;  // Am I student or mentor?

// Boolean flags (true/false) to track states
let isAudioMuted = false;  // Is my mic muted?
let isVideoOff = false;  // Is my camera off?
let isScreenSharing = false;  // Am I sharing screen?
let isHandRaised = false;  // Did I raise my hand?
let sidePanelOpen = false;  // Is chat/participants panel open?
let isRecording = false;  // Am I recording?

// Other variables
let sessionStartTime;  // When did the meeting start?
let timerInterval;  // Timer that updates every second
let unreadMessages = 0;  // How many unread chat messages?
let selectedFile = null;  // File selected for sharing
let mediaRecorder;  // For recording video
let recordedChunks = [];  // Recorded video data

// Step 4: STUN servers - these help connect two computers over the internet
// STUN = Session Traversal Utilities for NAT
// Google provides free STUN servers for WebRTC
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// Join button
joinBtn.addEventListener('click', async () => {
  userName = userNameInput.value.trim();
  userRole = userRoleSelect.value;
  roomId = roomIdInput.value.trim();
  
  if (!userName || !roomId) {
    alert('Please enter your name and meeting ID');
    return;
  }

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    localVideo.srcObject = localStream;
    document.getElementById('localName').textContent = userName;
    document.getElementById('roomIdDisplay').textContent = `Meeting ID: ${roomId}`;
    
    socket.emit('join-room', roomId, {
      id: socket.id,
      name: userName,
      role: userRole
    });
    
    joinSection.classList.add('hidden');
    mainContent.classList.remove('hidden');
    
    startTimer();
    initializeParticipantList();
    makeDraggable();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Could not access camera/microphone');
  }
});

// Make local video draggable
function makeDraggable() {
  const container = document.getElementById('localVideoContainer');
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    initialX = e.clientX - container.offsetLeft;
    initialY = e.clientY - container.offsetTop;
    container.style.cursor = 'grabbing';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      container.style.left = currentX + 'px';
      container.style.top = currentY + 'px';
      container.style.right = 'auto';
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    container.style.cursor = 'move';
  });
}

// Initialize participant list with current user
function initializeParticipantList() {
  participantList.innerHTML = `
    <div class="flex items-center gap-3 p-2 bg-gray-800 rounded">
      <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
        ${userName.charAt(0).toUpperCase()}
      </div>
      <div class="flex-1">
        <div class="text-sm font-medium">${userName} (You)</div>
        <div class="text-xs text-gray-400">${userRole}</div>
      </div>
      <div class="flex gap-1">
        <span id="myMicStatus">🎤</span>
        <span id="myCamStatus">📹</span>
      </div>
    </div>
  `;
}

// Timer
function startTimer() {
  sessionStartTime = Date.now();
  
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
}

// Side panel toggle
function toggleChat() {
  if (!sidePanelOpen) {
    sidePanel.style.transform = 'translateX(0)';
    sidePanelOpen = true;
    showChatTab();
    clearChatBadge();
  } else {
    sidePanel.style.transform = 'translateX(100%)';
    sidePanelOpen = false;
  }
}

function updateChatBadge() {
  const badge = document.getElementById('chatBadge');
  console.log('🔔 Updating badge:', unreadMessages, badge);
  if (badge) {
    if (unreadMessages > 0) {
      badge.textContent = unreadMessages > 9 ? '9+' : unreadMessages;
      badge.classList.remove('hidden');
      console.log('✅ Badge shown:', badge.textContent);
    } else {
      badge.classList.add('hidden');
      console.log('❌ Badge hidden');
    }
  }
}

function clearChatBadge() {
  unreadMessages = 0;
  updateChatBadge();
}

function toggleParticipants() {
  if (!sidePanelOpen) {
    sidePanel.style.transform = 'translateX(0)';
    sidePanelOpen = true;
    showParticipantsTab();
  } else {
    sidePanel.style.transform = 'translateX(100%)';
    sidePanelOpen = false;
  }
}

if (toggleChatBtn) toggleChatBtn.addEventListener('click', toggleChat);
if (toggleParticipantsBtn) toggleParticipantsBtn.addEventListener('click', toggleParticipants);

chatTab.addEventListener('click', showChatTab);
participantsTab.addEventListener('click', showParticipantsTab);

function showChatTab() {
  chatTab.classList.add('border-blue-500', 'text-white');
  chatTab.classList.remove('text-gray-400');
  participantsTab.classList.remove('border-blue-500', 'text-white');
  participantsTab.classList.add('text-gray-400');
  chatContent.classList.remove('hidden');
  participantsContent.classList.add('hidden');
  clearChatBadge();
}

function showParticipantsTab() {
  participantsTab.classList.add('border-blue-500', 'text-white');
  participantsTab.classList.remove('text-gray-400');
  chatTab.classList.remove('border-blue-500', 'text-white');
  chatTab.classList.add('text-gray-400');
  participantsContent.classList.remove('hidden');
  chatContent.classList.add('hidden');
}

// WebRTC
socket.on('user-connected', async (userData) => {
  console.log('✅ User connected:', userData);
  addMessage('system', `${userData.name} joined`);
  updateParticipants(userData);
  
  try {
    await createPeerConnection(userData.id);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    console.log('📤 Sending offer');
    socket.emit('offer', {
      offer: offer,
      to: userData.id
    });
  } catch (err) {
    console.error('❌ Error in user-connected:', err);
  }
});

socket.on('offer', async (data) => {
  await createPeerConnection(data.from);
  await peerConnection.setRemoteDescription(data.offer);
  
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  
  socket.emit('answer', {
    answer: answer,
    to: data.from
  });
});

socket.on('answer', async (data) => {
  await peerConnection.setRemoteDescription(data.answer);
});

socket.on('ice-candidate', async (data) => {
  try {
    await peerConnection.addIceCandidate(data.candidate);
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
  }
});

socket.on('user-disconnected', (userData) => {
  addMessage('system', `${userData.name} left`);
  document.getElementById('remoteName').textContent = 'Waiting for others...';
  document.getElementById('participantCount').textContent = '1';
  
  // Reset participant list to just current user
  initializeParticipantList();
  
  if (remoteVideo.srcObject) {
    remoteVideo.srcObject.getTracks().forEach(track => track.stop());
    remoteVideo.srcObject = null;
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
});

async function createPeerConnection(otherUserId) {
  peerConnection = new RTCPeerConnection(iceServers);
  
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });
  
  peerConnection.ontrack = (event) => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
      remoteVideo.srcObject = remoteStream;
    }
    remoteStream.addTrack(event.track);
  };
  
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', {
        candidate: event.candidate,
        to: otherUserId
      });
    }
  };
}

// Controls
muteBtn.addEventListener('click', () => {
  if (!localStream) return;
  
  isAudioMuted = !isAudioMuted;
  localStream.getAudioTracks()[0].enabled = !isAudioMuted;
  
  if (isAudioMuted) {
    muteBtn.classList.remove('bg-gray-700');
    muteBtn.classList.add('bg-red-600');
  } else {
    muteBtn.classList.remove('bg-red-600');
    muteBtn.classList.add('bg-gray-700');
  }
  const muteIcon = document.getElementById('muteIcon');
  const muteLabel = muteBtn.querySelector('span:last-child');
  if (muteIcon) muteIcon.textContent = isAudioMuted ? '🔇' : '🎤';
  if (muteLabel) muteLabel.textContent = isAudioMuted ? 'Unmute' : 'Mute';
  
  const localMicStatus = document.getElementById('localMicStatus');
  if (localMicStatus) localMicStatus.textContent = isAudioMuted ? '🔇' : '🎤';
  
  // Update in participant list too
  const myMicStatus = document.getElementById('myMicStatus');
  if (myMicStatus) myMicStatus.textContent = isAudioMuted ? '🔇' : '🎤';
  
  socket.emit('media-state', {
    roomId: roomId,
    audio: !isAudioMuted,
    video: !isVideoOff
  });
});

videoBtn.addEventListener('click', () => {
  if (!localStream) return;
  
  isVideoOff = !isVideoOff;
  localStream.getVideoTracks()[0].enabled = !isVideoOff;
  
  if (isVideoOff) {
    videoBtn.classList.remove('bg-gray-700');
    videoBtn.classList.add('bg-red-600');
  } else {
    videoBtn.classList.remove('bg-red-600');
    videoBtn.classList.add('bg-gray-700');
  }
  const videoIcon = document.getElementById('videoIcon');
  const videoLabel = videoBtn.querySelector('span:last-child');
  if (videoIcon) videoIcon.textContent = isVideoOff ? '📹' : '📹';
  if (videoLabel) videoLabel.textContent = isVideoOff ? 'Start Video' : 'Stop Video';
  
  const localCamStatus = document.getElementById('localCamStatus');
  if (localCamStatus) localCamStatus.textContent = isVideoOff ? '❌' : '📹';
  
  // Update in participant list too
  const myCamStatus = document.getElementById('myCamStatus');
  if (myCamStatus) myCamStatus.textContent = isVideoOff ? '❌' : '📹';
  
  socket.emit('media-state', {
    roomId: roomId,
    audio: !isAudioMuted,
    video: !isVideoOff
  });
});

screenShareBtn.addEventListener('click', async () => {
  if (!isScreenSharing) {
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      
      const screenTrack = screenStream.getVideoTracks()[0];
      if (peerConnection) {
        const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      }
      
      localVideo.srcObject = screenStream;
      isScreenSharing = true;
      screenShareBtn.classList.remove('bg-gray-700');
      screenShareBtn.classList.add('bg-green-600');
      const shareLabel = screenShareBtn.querySelector('span:last-child');
      if (shareLabel) shareLabel.textContent = 'Stop Share';
      
      screenTrack.onended = () => stopScreenShare();
      
    } catch (error) {
      console.error('Screen share error:', error);
    }
  } else {
    stopScreenShare();
  }
});

function stopScreenShare() {
  if (screenStream) {
    screenStream.getTracks().forEach(track => track.stop());
  }
  
  if (peerConnection && localStream) {
    const videoTrack = localStream.getVideoTracks()[0];
    const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
    if (sender) sender.replaceTrack(videoTrack);
  }
  
  localVideo.srcObject = localStream;
  isScreenSharing = false;
  screenShareBtn.classList.remove('bg-green-600');
  screenShareBtn.classList.add('bg-gray-700');
  const shareLabel = screenShareBtn.querySelector('span:last-child');
  if (shareLabel) shareLabel.textContent = 'Share Screen';
}

raiseHandBtn.addEventListener('click', () => {
  if (!isHandRaised) {
    // Raise hand
    isHandRaised = true;
    raiseHandBtn.classList.remove('bg-gray-700');
    raiseHandBtn.classList.add('bg-yellow-600');
    const handLabel = raiseHandBtn.querySelector('span:last-child');
    if (handLabel) handLabel.textContent = 'Lower Hand';
    
    // Show hand on own video
    const myHandIndicator = document.getElementById('myHandIndicator');
    if (myHandIndicator) myHandIndicator.classList.remove('hidden');
    
    socket.emit('raise-hand', {
      roomId: roomId,
      raised: true,
      userName: userName
    });
  } else {
    // Lower hand
    isHandRaised = false;
    raiseHandBtn.classList.remove('bg-yellow-600');
    raiseHandBtn.classList.add('bg-gray-700');
    const handLabel = raiseHandBtn.querySelector('span:last-child');
    if (handLabel) handLabel.textContent = 'Reactions';
    
    // Hide hand on own video
    const myHandIndicator = document.getElementById('myHandIndicator');
    if (myHandIndicator) myHandIndicator.classList.add('hidden');
    
    socket.emit('raise-hand', {
      roomId: roomId,
      raised: false,
      userName: userName
    });
  }
});

socket.on('raise-hand', (data) => {
  const indicator = document.getElementById('raiseHandIndicator');
  if (data.raised) {
    indicator.classList.remove('hidden');
    addMessage('system', `${data.userName} raised hand`);
  } else {
    indicator.classList.add('hidden');
  }
});

socket.on('media-state', (data) => {
  document.getElementById('remoteMicStatus').textContent = data.audio ? '🎤' : '🔇';
  document.getElementById('remoteCamStatus').textContent = data.video ? '📹' : '❌';
  
  // Update in participant list too
  const remoteMicList = document.getElementById('remoteMicStatusList');
  const remoteCamList = document.getElementById('remoteCamStatusList');
  if (remoteMicList) remoteMicList.textContent = data.audio ? '🎤' : '🔇';
  if (remoteCamList) remoteCamList.textContent = data.video ? '📹' : '❌';
});

// Chat
sendChatBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// File attachment
attachBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile = file;
    fileName.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    filePreview.classList.remove('hidden');
  }
});

removeFile.addEventListener('click', () => {
  selectedFile = null;
  fileInput.value = '';
  filePreview.classList.add('hidden');
});

function sendMessage() {
  const message = chatInput.value.trim();
  
  if (selectedFile) {
    // Send file
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = {
        roomId: roomId,
        userName: userName,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileData: e.target.result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      socket.emit('chat-file', fileData);
      addFileMessage('me', selectedFile.name, selectedFile.type, e.target.result);
      
      // Reset
      selectedFile = null;
      fileInput.value = '';
      filePreview.classList.add('hidden');
      chatInput.value = '';
    };
    reader.readAsDataURL(selectedFile);
  } else if (message) {
    // Send text message
    socket.emit('chat-message', {
      roomId: roomId,
      userName: userName,
      message: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    addMessage('me', message);
    chatInput.value = '';
  }
}

socket.on('chat-message', (data) => {
  addMessage('other', data.message, data.userName, data.timestamp);
  
  // Show notification badge if chat panel is not visible
  const isChatVisible = sidePanelOpen && !chatContent.classList.contains('hidden');
  if (!isChatVisible) {
    unreadMessages++;
    updateChatBadge();
    console.log('📬 New message notification:', unreadMessages);
  }
});

socket.on('chat-file', (data) => {
  addFileMessage('other', data.fileName, data.fileType, data.fileData, data.userName, data.timestamp);
  
  // Show notification badge
  const isChatVisible = sidePanelOpen && !chatContent.classList.contains('hidden');
  if (!isChatVisible) {
    unreadMessages++;
    updateChatBadge();
  }
});

function addMessage(type, message, name = '', timestamp = '') {
  const div = document.createElement('div');
  
  if (type === 'system') {
    div.className = 'text-center text-xs text-gray-500 py-1';
    div.textContent = message;
  } else if (type === 'me') {
    div.className = 'flex justify-end gap-2 items-end';
    const initial = userName.charAt(0).toUpperCase();
    div.innerHTML = `
      <div class="bg-blue-600 rounded-lg px-3 py-2 max-w-xs">
        <div class="text-sm break-words">${message}</div>
        <div class="text-xs text-blue-200 mt-1">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        ${initial}
      </div>
    `;
  } else {
    div.className = 'flex justify-start gap-2 items-end';
    const initial = name.charAt(0).toUpperCase();
    div.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        ${initial}
      </div>
      <div class="bg-gray-800 rounded-lg px-3 py-2 max-w-xs">
        <div class="text-xs text-gray-400 mb-1">${name}</div>
        <div class="text-sm break-words">${message}</div>
        <div class="text-xs text-gray-500 mt-1">${timestamp}</div>
      </div>
    `;
  }
  
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addFileMessage(type, fileName, fileType, fileData, name = '', timestamp = '') {
  const div = document.createElement('div');
  const isImage = fileType.startsWith('image/');
  const fileExt = fileName.split('.').pop().toUpperCase();
  
  if (type === 'me') {
    div.className = 'flex justify-end gap-2 items-end mb-3';
    const initial = userName.charAt(0).toUpperCase();
    
    if (isImage) {
      div.innerHTML = `
        <div class="bg-blue-600 rounded-2xl p-2" style="max-width: 200px;">
          <img src="${fileData}" class="rounded-xl mb-1 w-full cursor-pointer hover:opacity-90 transition" style="max-height: 150px; width: 100%; object-fit: contain;" onclick="window.open('${fileData}')">
          <div class="px-1 py-1">
            <a href="${fileData}" download="${fileName}" class="text-xs text-blue-100 hover:underline block truncate">${fileName}</a>
            <span class="text-xs text-blue-200">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          ${initial}
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="bg-blue-600 rounded-2xl px-4 py-3 max-w-xs">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
              <span class="text-xs font-bold">📄</span>
            </div>
            <div class="flex-1 min-w-0">
              <a href="${fileData}" download="${fileName}" class="text-sm font-medium hover:underline block truncate">${fileName}</a>
              <span class="text-xs text-blue-200">${fileExt} file</span>
            </div>
          </div>
          <div class="text-xs text-blue-200">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          ${initial}
        </div>
      `;
    }
  } else {
    div.className = 'flex justify-start gap-2 items-end mb-3';
    const initial = name.charAt(0).toUpperCase();
    
    if (isImage) {
      div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          ${initial}
        </div>
        <div class="bg-gray-800 rounded-2xl p-2" style="max-width: 200px;">
          <div class="text-xs text-gray-400 mb-1 px-1">${name}</div>
          <img src="${fileData}" class="rounded-xl mb-1 w-full cursor-pointer hover:opacity-90 transition" style="max-height: 150px; width: 100%; object-fit: contain;" onclick="window.open('${fileData}')">
          <div class="px-1 py-1">
            <a href="${fileData}" download="${fileName}" class="text-xs text-gray-300 hover:underline block truncate">${fileName}</a>
            <span class="text-xs text-gray-500">${timestamp}</span>
          </div>
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          ${initial}
        </div>
        <div class="bg-gray-800 rounded-2xl px-4 py-3 max-w-xs">
          <div class="text-xs text-gray-400 mb-2">${name}</div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <span class="text-xs font-bold">📄</span>
            </div>
            <div class="flex-1 min-w-0">
              <a href="${fileData}" download="${fileName}" class="text-sm font-medium hover:underline block truncate">${fileName}</a>
              <span class="text-xs text-gray-400">${fileExt} file</span>
            </div>
          </div>
          <div class="text-xs text-gray-500">${timestamp}</div>
        </div>
      `;
    }
  }
  
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateParticipants(userData) {
  document.getElementById('remoteName').textContent = `${userData.name} (${userData.role})`;
  document.getElementById('participantCount').textContent = '2';
  
  // Add the new participant to the list
  const newParticipant = document.createElement('div');
  newParticipant.className = 'flex items-center gap-3 p-2 bg-gray-800 rounded';
  newParticipant.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold">
      ${userData.name.charAt(0).toUpperCase()}
    </div>
    <div class="flex-1">
      <div class="text-sm font-medium">${userData.name}</div>
      <div class="text-xs text-gray-400">${userData.role}</div>
    </div>
    <div class="flex gap-1">
      <span id="remoteMicStatusList">🎤</span>
      <span id="remoteCamStatusList">📹</span>
    </div>
  `;
  participantList.appendChild(newParticipant);
}

// Recording
recordBtn.addEventListener('click', async () => {
  if (!isRecording) {
    try {
      // Start recording
      const stream = remoteVideo.srcObject || localVideo.srcObject;
      if (!stream) {
        alert('No video stream available to record');
        return;
      }
      
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      recordedChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        
        addMessage('system', 'Recording saved!');
      };
      
      mediaRecorder.start();
      isRecording = true;
      
      recordBtn.classList.remove('bg-gray-700');
      recordBtn.classList.add('bg-red-600');
      recordBtn.querySelector('span:last-child').textContent = 'Stop Recording';
      
      addMessage('system', 'Recording started...');
      
    } catch (error) {
      console.error('Recording error:', error);
      alert('Could not start recording');
    }
  } else {
    // Stop recording
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      isRecording = false;
      
      recordBtn.classList.remove('bg-red-600');
      recordBtn.classList.add('bg-gray-700');
      recordBtn.querySelector('span:last-child').textContent = 'Record';
    }
  }
});

hangupBtn.addEventListener('click', () => {
  cleanup();
  location.reload();
});

function cleanup() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
  }
  if (localStream) localStream.getTracks().forEach(track => track.stop());
  if (remoteStream) remoteStream.getTracks().forEach(track => track.stop());
  if (screenStream) screenStream.getTracks().forEach(track => track.stop());
  if (peerConnection) peerConnection.close();
  if (timerInterval) clearInterval(timerInterval);
  socket.disconnect();
}
