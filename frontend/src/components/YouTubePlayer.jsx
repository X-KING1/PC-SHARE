// Custom YouTube Player - Clean Design with End Screen Blocker Only
import { useEffect, useRef, useState } from 'react'

const YouTubePlayer = ({ videoUrl, title }) => {
    const containerRef = useRef(null)
    const playerRef = useRef(null)
    const timerRef = useRef(null)
    const [showOverlay, setShowOverlay] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)

    // Extract video ID from YouTube URL
    const getVideoId = (url) => {
        if (!url) return null
        const match = url.match(/[?&]v=([^&]+)/)
        return match ? match[1] : null
    }

    const videoId = getVideoId(videoUrl)

    useEffect(() => {
        if (!videoId) return

        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script')
            tag.src = 'https://www.youtube.com/iframe_api'
            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

            window.onYouTubeIframeAPIReady = initPlayer
        } else {
            initPlayer()
        }

        function initPlayer() {
            if (playerRef.current) {
                playerRef.current.destroy()
            }

            playerRef.current = new window.YT.Player(containerRef.current, {
                videoId: videoId,
                playerVars: {
                    rel: 0,
                    modestbranding: 1,
                    controls: 1,
                    fs: 1,
                    iv_load_policy: 3,
                    origin: window.location.origin
                },
                events: {
                    onStateChange: (event) => {
                        if (event.data === 1) {
                            setIsPlaying(true)
                            setShowOverlay(false)
                            startTimeCheck()
                        } else if (event.data === 0) {
                            setShowOverlay(true)
                            setIsPlaying(false)
                            stopTimeCheck()
                        } else if (event.data === 2) {
                            setIsPlaying(false)
                            stopTimeCheck()
                        }
                    }
                }
            })
        }

        function startTimeCheck() {
            stopTimeCheck()
            timerRef.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
                    const currentTime = playerRef.current.getCurrentTime()
                    const duration = playerRef.current.getDuration()
                    if (duration > 0 && (duration - currentTime) <= 60) {
                        setShowOverlay(true)
                        stopTimeCheck()
                    }
                }
            }, 500)
        }

        function stopTimeCheck() {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }

        return () => {
            stopTimeCheck()
            if (playerRef.current) {
                playerRef.current.destroy()
            }
        }
    }, [videoId])

    const handleReplay = () => {
        if (playerRef.current) {
            playerRef.current.seekTo(0)
            playerRef.current.playVideo()
            setShowOverlay(false)
        }
    }

    if (!videoId) return null

    return (
        <div style={{
            position: 'relative',
            aspectRatio: '16/9',
            width: '100%',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            backgroundColor: '#111827'
        }}>
            {/* YouTube Player */}
            <div ref={containerRef} style={{ width: '100%', height: '100%' }}></div>

            {/* End Screen Overlay - Only shows 1 minute before video ends */}
            {showOverlay && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#111827',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎬</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Video Complete!</h3>
                        <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>{title}</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={handleReplay}
                                style={{
                                    backgroundColor: '#9333ea',
                                    color: 'white',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                🔄 Replay Video
                            </button>
                            <button
                                onClick={() => setShowOverlay(false)}
                                style={{
                                    backgroundColor: '#374151',
                                    color: 'white',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕ Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default YouTubePlayer
