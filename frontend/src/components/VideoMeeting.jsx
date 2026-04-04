// VideoMeeting.jsx — Full WebRTC video meeting component
// Ported from web video/client/app.js into React
import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import config from '../config'

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
}

const VideoMeeting = ({ userName: defaultName, defaultRoom, defaultRole, onClose }) => {
    // State
    const [joined, setJoined] = useState(false)
    const [nameInput, setNameInput] = useState(defaultName || '')
    const [roleInput, setRoleInput] = useState(defaultRole || 'student')
    const [roomInput, setRoomInput] = useState(defaultRoom || '')
    const [isAudioMuted, setIsAudioMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [isHandRaised, setIsHandRaised] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [showParticipants, setShowParticipants] = useState(false)
    const [messages, setMessages] = useState([])
    const [chatInput, setChatInput] = useState('')
    const [remoteName, setRemoteName] = useState('Waiting for others...')
    const [remoteHandRaised, setRemoteHandRaised] = useState(false)
    const [remoteMic, setRemoteMic] = useState(true)
    const [remoteCam, setRemoteCam] = useState(true)
    const [participantCount, setParticipantCount] = useState(1)
    const [timer, setTimer] = useState('00:00')
    const [remoteUser, setRemoteUser] = useState(null)
    const [unreadCount, setUnreadCount] = useState(0)

    // Refs
    const socketRef = useRef(null)
    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)
    const localStreamRef = useRef(null)
    const remoteStreamRef = useRef(null)
    const peerConnectionRef = useRef(null)
    const screenStreamRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const recordedChunksRef = useRef([])
    const timerIntervalRef = useRef(null)
    const chatContainerRef = useRef(null)
    const fileInputRef = useRef(null)
    const roomIdRef = useRef('')
    const userNameRef = useRef('')

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup()
        }
    }, [])

    // Re-attach streams to video elements after meeting room renders (needed for auto-join)
    useEffect(() => {
        if (joined) {
            // Local stream (PIP)
            if (localStreamRef.current && localVideoRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current
            }
            // Remote stream (big video) — ontrack may have fired before this element existed
            if (remoteStreamRef.current && remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStreamRef.current
            }
        }
    }, [joined])



    const cleanup = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) mediaRecorderRef.current.stop()
        if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop())
        if (remoteStreamRef.current) remoteStreamRef.current.getTracks().forEach(t => t.stop())
        if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop())
        if (peerConnectionRef.current) peerConnectionRef.current.close()
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
        if (socketRef.current) socketRef.current.disconnect()
    }, [isRecording])

    const addMessage = useCallback((type, text, name = '', timestamp = '') => {
        setMessages(prev => [...prev, { type, text, name, timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
        setTimeout(() => {
            if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }, 50)
    }, [])

    const createPeerConnection = useCallback((otherUserId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS)
        peerConnectionRef.current = pc

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current)
            })
        }

        pc.ontrack = (event) => {
            if (!remoteStreamRef.current) {
                remoteStreamRef.current = new MediaStream()
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current
            }
            remoteStreamRef.current.addTrack(event.track)
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('ice-candidate', {
                    candidate: event.candidate,
                    to: otherUserId
                })
            }
        }

        return pc
    }, [])

    // Join meeting
    const handleJoin = async () => {
        if (!nameInput.trim() || !roomInput.trim()) {
            alert('Please enter your name and meeting ID')
            return
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            localStreamRef.current = stream
            if (localVideoRef.current) localVideoRef.current.srcObject = stream

            roomIdRef.current = roomInput.trim()
            userNameRef.current = nameInput.trim()

            // Connect socket
            const socket = io(config.API_BASE)
            socketRef.current = socket

            socket.on('connect', () => {
                console.log('🔌 Socket connected:', socket.id)
                console.log('🏠 Joining room:', roomIdRef.current)
                socket.emit('join-room', roomIdRef.current, {
                    id: socket.id,
                    name: userNameRef.current,
                    role: roleInput
                })
            })

            // WebRTC signaling
            socket.on('user-connected', async (userData) => {
                console.log('👤 User connected to room:', userData)
                setRemoteName(`${userData.name} (${userData.role})`)
                setRemoteUser(userData)
                setParticipantCount(2)
                addMessage('system', `${userData.name} joined the meeting`)

                const pc = createPeerConnection(userData.id)
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)
                console.log('📤 Sending offer to:', userData.id)
                socket.emit('offer', { offer, to: userData.id })
            })

            socket.on('offer', async (data) => {
                console.log('📥 Received offer from:', data.from, data.userData)
                // Update UI with the user who sent the offer
                if (data.userData) {
                    setRemoteName(`${data.userData.name} (${data.userData.role})`)
                    setRemoteUser({ ...data.userData, id: data.from })
                    setParticipantCount(2)
                    addMessage('system', `${data.userData.name} joined the meeting`)
                }
                const pc = createPeerConnection(data.from)
                await pc.setRemoteDescription(data.offer)
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                console.log('📤 Sending answer to:', data.from)
                socket.emit('answer', { answer, to: data.from })
            })

            socket.on('answer', async (data) => {
                console.log('📥 Received answer from:', data.from)
                // Update UI with the user who answered (if not already set)
                if (data.userData) {
                    setRemoteName(`${data.userData.name} (${data.userData.role})`)
                    setRemoteUser({ ...data.userData, id: data.from })
                    setParticipantCount(2)
                }
                if (peerConnectionRef.current) {
                    await peerConnectionRef.current.setRemoteDescription(data.answer)
                }
            })

            socket.on('ice-candidate', async (data) => {
                try {
                    if (peerConnectionRef.current) {
                        await peerConnectionRef.current.addIceCandidate(data.candidate)
                    }
                } catch (e) { console.error('ICE error:', e) }
            })

            socket.on('user-disconnected', (userData) => {
                addMessage('system', `${userData.name} left`)
                setRemoteName('Waiting for others...')
                setRemoteUser(null)
                setParticipantCount(1)
                if (remoteVideoRef.current?.srcObject) {
                    remoteVideoRef.current.srcObject.getTracks().forEach(t => t.stop())
                    remoteVideoRef.current.srcObject = null
                }
                remoteStreamRef.current = null
                if (peerConnectionRef.current) {
                    peerConnectionRef.current.close()
                    peerConnectionRef.current = null
                }
            })

            // Chat
            socket.on('chat-message', (data) => {
                addMessage('other', data.message, data.userName, data.timestamp)
                setUnreadCount(prev => prev + 1)
            })

            socket.on('chat-file', (data) => {
                addMessage('file', data.fileName, data.userName, data.timestamp)
                setUnreadCount(prev => prev + 1)
            })

            // Media state
            socket.on('media-state', (data) => {
                setRemoteMic(data.audio)
                setRemoteCam(data.video)
            })

            socket.on('raise-hand', (data) => {
                setRemoteHandRaised(data.raised)
                if (data.raised) addMessage('system', `${data.userName} raised hand ✋`)
            })

            // Timer
            const startTime = Date.now()
            timerIntervalRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000)
                const m = String(Math.floor(elapsed / 60)).padStart(2, '0')
                const s = String(elapsed % 60).padStart(2, '0')
                setTimer(`${m}:${s}`)
            }, 1000)

            setJoined(true)
        } catch (error) {
            console.error('Join error:', error)
            alert('Could not access camera/microphone. Please allow permissions.')
        }
    }

    // Controls

    // Auto-join when defaultName and defaultRoom are provided (from MentorDashboard/PurchasedCourses)
    const autoJoinedRef = useRef(false)
    useEffect(() => {
        if (defaultName && defaultRoom && !autoJoinedRef.current && !joined) {
            autoJoinedRef.current = true
            handleJoin()
        }
    }, [defaultName, defaultRoom])
    const toggleMute = () => {
        if (!localStreamRef.current) return
        const audioTrack = localStreamRef.current.getAudioTracks()[0]
        if (audioTrack) {
            audioTrack.enabled = isAudioMuted
            setIsAudioMuted(!isAudioMuted)
            socketRef.current?.emit('media-state', {
                roomId: roomIdRef.current,
                audio: isAudioMuted,
                video: !isVideoOff
            })
        }
    }

    const toggleVideo = () => {
        if (!localStreamRef.current) return
        const videoTrack = localStreamRef.current.getVideoTracks()[0]
        if (videoTrack) {
            videoTrack.enabled = isVideoOff
            setIsVideoOff(!isVideoOff)
            socketRef.current?.emit('media-state', {
                roomId: roomIdRef.current,
                audio: !isAudioMuted,
                video: isVideoOff
            })
        }
    }

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screen = await navigator.mediaDevices.getDisplayMedia({ video: true })
                screenStreamRef.current = screen
                const screenTrack = screen.getVideoTracks()[0]

                if (peerConnectionRef.current) {
                    const senders = peerConnectionRef.current.getSenders()
                    console.log('📺 Screen share - senders:', senders.map(s => ({ kind: s.track?.kind, id: s.track?.id })))
                    // Find the video sender (try by kind first, then by position)
                    let videoSender = senders.find(s => s.track?.kind === 'video')
                    if (!videoSender) {
                        // Fallback: find any sender that could carry video
                        videoSender = senders.find(s => s.track === null || s.track?.kind === 'video')
                    }
                    if (videoSender) {
                        await videoSender.replaceTrack(screenTrack)
                        console.log('📺 Screen track replaced on sender')
                    } else {
                        // No sender found - add track and renegotiate
                        console.log('📺 No video sender found, adding track')
                        peerConnectionRef.current.addTrack(screenTrack, screen)
                    }
                } else {
                    console.warn('📺 No peer connection for screen share')
                }
                if (localVideoRef.current) localVideoRef.current.srcObject = screen
                setIsScreenSharing(true)

                screenTrack.onended = () => stopScreenShare()
            } catch (e) { console.error('Screen share error:', e) }
        } else {
            stopScreenShare()
        }
    }

    const stopScreenShare = () => {
        if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop())
        if (peerConnectionRef.current && localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0]
            const senders = peerConnectionRef.current.getSenders()
            const videoSender = senders.find(s => s.track?.kind === 'video') || senders.find(s => s.track === null)
            if (videoSender && videoTrack) {
                videoSender.replaceTrack(videoTrack)
                console.log('📺 Restored camera track on sender')
            }
        }
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current
        setIsScreenSharing(false)
    }

    const toggleRaiseHand = () => {
        const raised = !isHandRaised
        setIsHandRaised(raised)
        socketRef.current?.emit('raise-hand', {
            roomId: roomIdRef.current,
            raised,
            userName: userNameRef.current
        })
    }

    const toggleRecording = async () => {
        if (!isRecording) {
            const stream = remoteVideoRef.current?.srcObject || localVideoRef.current?.srcObject
            if (!stream) { alert('No video to record'); return }
            try {
                const mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
                recordedChunksRef.current = []
                mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data) }
                mr.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = `recording-${Date.now()}.webm`; a.click()
                    URL.revokeObjectURL(url)
                    addMessage('system', 'Recording saved!')
                }
                mr.start()
                mediaRecorderRef.current = mr
                setIsRecording(true)
                addMessage('system', 'Recording started...')
            } catch (e) { console.error('Record error:', e); alert('Could not start recording') }
        } else {
            if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const sendMessage = () => {
        const msg = chatInput.trim()
        if (!msg) return
        socketRef.current?.emit('chat-message', {
            roomId: roomIdRef.current,
            userName: userNameRef.current,
            message: msg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        addMessage('me', msg)
        setChatInput('')
    }

    const handleFileShare = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            socketRef.current?.emit('chat-file', {
                roomId: roomIdRef.current,
                userName: userNameRef.current,
                fileName: file.name,
                fileType: file.type,
                fileData: ev.target.result,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            addMessage('me', `📎 ${file.name}`)
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const handleHangup = () => {
        cleanup()
        if (onClose) onClose()
    }

    const openChat = () => {
        setShowChat(true)
        setShowParticipants(false)
        setUnreadCount(0)
    }

    // ─── JOIN SCREEN ──────────────────────────────────────────
    if (!joined) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #5624d0 0%, #7c3aed 100%)',
                borderRadius: '16px', padding: '40px', marginTop: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{
                    background: 'white', borderRadius: '16px', padding: '36px',
                    width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{
                            width: '56px', height: '56px', background: '#5624d0', borderRadius: '14px',
                            margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '28px'
                        }}>📹</div>
                        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Join Video Meeting</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="Enter your name"
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '10px',
                                border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none',
                                boxSizing: 'border-box', color: '#1e293b', background: 'white'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#5624d0'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                        <select
                            value={roleInput}
                            onChange={(e) => setRoleInput(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '10px',
                                border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none',
                                boxSizing: 'border-box', background: 'white', color: '#1e293b'
                            }}
                        >
                            <option value="student">Student</option>
                            <option value="mentor">Mentor</option>
                        </select>
                        <input
                            value={roomInput}
                            onChange={(e) => setRoomInput(e.target.value)}
                            placeholder="Meeting ID (e.g. room1)"
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '10px',
                                border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none',
                                boxSizing: 'border-box', color: '#1e293b', background: 'white'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#5624d0'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        />
                        <button
                            onClick={handleJoin}
                            style={{
                                width: '100%', padding: '14px', background: '#5624d0',
                                color: 'white', border: 'none', borderRadius: '10px',
                                fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(86,36,208,0.35)'
                            }}
                        >
                            Join Meeting
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ─── MEETING ROOM ─────────────────────────────────────────
    return (
        <div style={{
            marginTop: '24px', borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', background: '#0d0d0d'
        }}>
            {/* Top Bar */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 16px', background: '#1c1e20'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#22c55e', fontSize: '12px' }}>🔒</span>
                    <span style={{ color: 'white', fontSize: '12px', fontWeight: '500' }}>Meeting: {roomInput}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db', fontSize: '12px' }}>
                    <span>🔴</span>
                    <span>{timer}</span>
                </div>
            </div>

            {/* Video Area */}
            <div style={{ position: 'relative', height: '480px', background: '#0d0d0d' }}>
                {/* Remote Video (full) */}
                <video ref={remoteVideoRef} autoPlay playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                    position: 'absolute', bottom: '12px', left: '12px',
                    background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '6px',
                    fontSize: '13px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <span>{remoteName}</span>
                    <span>{remoteMic ? '🎤' : '🔇'}</span>
                    <span>{remoteCam ? '📹' : '❌'}</span>
                </div>

                {/* Remote hand raised */}
                {remoteHandRaised && (
                    <div style={{
                        position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
                        background: '#facc15', color: '#1e293b', padding: '8px 20px', borderRadius: '20px',
                        fontWeight: '700', fontSize: '14px', animation: 'bounce 1s infinite'
                    }}>
                        ✋ Hand Raised
                    </div>
                )}

                {/* Local Video PIP */}
                <div style={{
                    position: 'absolute', top: '16px', right: '16px',
                    width: '200px', borderRadius: '12px', overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)', border: '2px solid #374151'
                }}>
                    <video ref={localVideoRef} autoPlay muted playsInline
                        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', background: '#111827' }} />
                    <div style={{
                        position: 'absolute', bottom: '6px', left: '8px',
                        background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '4px',
                        fontSize: '11px', color: 'white', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <span>{nameInput}</span>
                        <span>{isAudioMuted ? '🔇' : '🎤'}</span>
                        <span>{isVideoOff ? '❌' : '📹'}</span>
                    </div>
                    {isHandRaised && (
                        <div style={{
                            position: 'absolute', top: '6px', right: '6px',
                            background: '#facc15', color: '#000', padding: '2px 6px', borderRadius: '8px',
                            fontSize: '11px', fontWeight: '700'
                        }}>✋</div>
                    )}
                </div>

                {/* Side Panel (Chat / Participants) */}
                {(showChat || showParticipants) && (
                    <div style={{
                        position: 'absolute', top: 0, right: 0, height: '100%', width: '300px',
                        background: '#111827', boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
                        display: 'flex', flexDirection: 'column', zIndex: 10
                    }}>
                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #374151' }}>
                            <button onClick={openChat}
                                style={{
                                    flex: 1, padding: '12px', fontSize: '13px', fontWeight: '500', border: 'none', cursor: 'pointer',
                                    background: 'transparent',
                                    color: showChat ? 'white' : '#9ca3af',
                                    borderBottom: showChat ? '2px solid #3b82f6' : '2px solid transparent'
                                }}>Chat</button>
                            <button onClick={() => { setShowParticipants(true); setShowChat(false) }}
                                style={{
                                    flex: 1, padding: '12px', fontSize: '13px', fontWeight: '500', border: 'none', cursor: 'pointer',
                                    background: 'transparent',
                                    color: showParticipants ? 'white' : '#9ca3af',
                                    borderBottom: showParticipants ? '2px solid #3b82f6' : '2px solid transparent'
                                }}>Participants</button>
                            <button onClick={() => { setShowChat(false); setShowParticipants(false) }}
                                style={{
                                    padding: '12px', fontSize: '14px', border: 'none', cursor: 'pointer',
                                    background: 'transparent', color: '#9ca3af'
                                }}>✕</button>
                        </div>

                        {/* Chat Content */}
                        {showChat && (
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {messages.map((msg, i) => (
                                        <div key={i} style={{
                                            textAlign: msg.type === 'system' ? 'center' : msg.type === 'me' ? 'right' : 'left',
                                        }}>
                                            {msg.type === 'system' ? (
                                                <span style={{ fontSize: '11px', color: '#6b7280' }}>{msg.text}</span>
                                            ) : (
                                                <div style={{
                                                    display: 'inline-block', maxWidth: '220px', textAlign: 'left',
                                                    padding: '8px 12px', borderRadius: '12px',
                                                    background: msg.type === 'me' ? '#3b82f6' : '#1f2937',
                                                    color: 'white', fontSize: '13px'
                                                }}>
                                                    {msg.type === 'other' && <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>{msg.name}</div>}
                                                    <div style={{ wordBreak: 'break-word' }}>{msg.text}</div>
                                                    <div style={{ fontSize: '10px', color: msg.type === 'me' ? '#93c5fd' : '#6b7280', marginTop: '2px' }}>{msg.timestamp}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '10px', borderTop: '1px solid #374151', display: 'flex', gap: '6px' }}>
                                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileShare} />
                                    <button onClick={() => fileInputRef.current?.click()}
                                        style={{ padding: '8px 10px', background: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '14px' }}>📎</button>
                                    <input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Message..."
                                        style={{
                                            flex: 1, padding: '8px 12px', borderRadius: '8px',
                                            background: '#1f2937', border: '1px solid #374151',
                                            color: 'white', fontSize: '13px', outline: 'none'
                                        }}
                                    />
                                    <button onClick={sendMessage}
                                        style={{ padding: '8px 14px', background: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '13px', fontWeight: '600' }}>Send</button>
                                </div>
                            </div>
                        )}

                        {/* Participants Content */}
                        {showParticipants && (
                            <div style={{ padding: '12px' }}>
                                <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
                                    In meeting: <span style={{ color: 'white', fontWeight: '600' }}>{participantCount}</span>
                                </div>
                                {/* Self */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: '#1f2937', borderRadius: '8px', marginBottom: '6px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', fontSize: '13px' }}>
                                        {nameInput.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'white' }}>{nameInput} (You)</div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{roleInput}</div>
                                    </div>
                                    <span>{isAudioMuted ? '🔇' : '🎤'}</span>
                                    <span>{isVideoOff ? '❌' : '📹'}</span>
                                </div>
                                {/* Remote */}
                                {remoteUser && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: '#1f2937', borderRadius: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', fontSize: '13px' }}>
                                            {remoteUser.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: '500', color: 'white' }}>{remoteUser.name}</div>
                                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{remoteUser.role}</div>
                                        </div>
                                        <span>{remoteMic ? '🎤' : '🔇'}</span>
                                        <span>{remoteCam ? '📹' : '❌'}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Control Bar */}
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
                padding: '12px 16px', background: '#1c1e20', flexWrap: 'wrap'
            }}>
                <ControlBtn icon={isAudioMuted ? '🔇' : '🎤'} label={isAudioMuted ? 'Unmute' : 'Mute'} onClick={toggleMute} active={isAudioMuted} />
                <ControlBtn icon={isVideoOff ? '📹' : '📹'} label={isVideoOff ? 'Start Video' : 'Stop Video'} onClick={toggleVideo} active={isVideoOff} />
                <ControlBtn icon="👥" label="Participants" onClick={() => { setShowParticipants(!showParticipants); setShowChat(false) }} />
                <ControlBtn icon="💬" label="Chat" onClick={openChat} badge={unreadCount} />
                <ControlBtn icon="✋" label={isHandRaised ? 'Lower Hand' : 'Reactions'} onClick={toggleRaiseHand} active={isHandRaised} activeColor="#ca8a04" />
                <ControlBtn icon="⬆️" label={isScreenSharing ? 'Stop Share' : 'Share Screen'} onClick={toggleScreenShare} active={isScreenSharing} activeColor="#16a34a" />
                <ControlBtn icon="⏺️" label={isRecording ? 'Stop Rec' : 'Record'} onClick={toggleRecording} active={isRecording} />
                <button onClick={handleHangup}
                    style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                        padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: '#dc2626', color: 'white', minWidth: '80px', fontSize: '12px', fontWeight: '500'
                    }}>
                    End
                </button>
            </div>
        </div>
    )
}

// Reusable control button
const ControlBtn = ({ icon, label, onClick, active, activeColor, badge }) => (
    <button onClick={onClick}
        style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: active ? (activeColor || '#dc2626') : '#374151',
            color: 'white', minWidth: '72px', position: 'relative',
            transition: 'background 0.2s'
        }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{ fontSize: '11px' }}>{label}</span>
        {badge > 0 && (
            <span style={{
                position: 'absolute', top: '4px', right: '4px',
                background: '#dc2626', color: 'white', width: '18px', height: '18px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: '700'
            }}>{badge > 9 ? '9+' : badge}</span>
        )}
    </button>
)

export default VideoMeeting
