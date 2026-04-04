// Forum Page — Premium Black & White Redesign
// Inter font · Minimal accents · Large images · Clean layout
import { useState, useRef, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import {
    useGetThreadsQuery,
    useGetThreadQuery,
    useGetUserVotesQuery,
    useCreateThreadMutation,
    useAddReplyMutation,
    useVoteThreadMutation,
    useDeleteThreadMutation,
    useDeleteReplyMutation,
} from '../store/api/forumApi'

/* ─── Icons ─── */
const UpArrow = ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? '#ff4500' : 'none'} stroke={active ? '#ff4500' : '#878a8c'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
)
const DownArrow = ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? '#7193ff' : 'none'} stroke={active ? '#7193ff' : '#878a8c'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
)
const ChatIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
)
const LinkIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
)
const ImageIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
)
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
)

const F = "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"

const Forum = () => {
    const { user, isAuthenticated } = useAuth()
    const [activeThread, setActiveThread] = useState(null)
    const [showNewForm, setShowNewForm] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newContent, setNewContent] = useState('')
    const [newImages, setNewImages] = useState([])
    const [newImagePreviews, setNewImagePreviews] = useState([])
    const [replyContent, setReplyContent] = useState('')
    const [replyImages, setReplyImages] = useState([])
    const [replyImagePreviews, setReplyImagePreviews] = useState([])
    const [userVotes, setUserVotes] = useState({})
    const threadImageRef = useRef(null)
    const replyImageRef = useRef(null)

    const { data: threads = [], isLoading } = useGetThreadsQuery()
    const { data: threadDetail } = useGetThreadQuery(activeThread, { skip: !activeThread })
    const { data: serverVotes } = useGetUserVotesQuery(user?.user_id, { skip: !user?.user_id })
    const [createThread, { isLoading: creating }] = useCreateThreadMutation()
    const [addReply, { isLoading: replying }] = useAddReplyMutation()
    const [voteThread] = useVoteThreadMutation()
    const [deleteThread] = useDeleteThreadMutation()
    const [deleteReply] = useDeleteReplyMutation()

    // Load existing votes from server
    useEffect(() => {
        if (serverVotes) setUserVotes(serverVotes)
    }, [serverVotes])

    const votingRef = useRef(false)

    /* ── Helpers ── */
    const handleImageSelect = (e, setImages, setPreviews, currentImages) => {
        const files = Array.from(e.target.files)
        if (currentImages.length + files.length > 5) { alert('Maximum 5 images allowed'); return }
        const vf = [], vp = []
        for (const f of files) { if (f.size > 5e6) { alert(`"${f.name}" exceeds 5 MB`); continue }; vf.push(f); vp.push(URL.createObjectURL(f)) }
        setImages(p => [...p, ...vf]); setPreviews(p => [...p, ...vp]); e.target.value = ''
    }
    const removeImage = (i, setI, setP) => { setI(p => p.filter((_, x) => x !== i)); setP(p => p.filter((_, x) => x !== i)) }
    const handleVote = async (id, dir) => {
        if (!user?.user_id) return
        if (userVotes[id] === dir) return
        if (votingRef.current) return
        votingRef.current = true
        try {
            const result = await voteThread({ threadId: id, user_id: user.user_id, vote_type: dir }).unwrap()
            setUserVotes(p => ({ ...p, [id]: result.userVote }))
        } catch (err) { console.error(err) }
        finally { votingRef.current = false }
    }
    const parseImages = (url) => {
        if (!url) return []
        try { const parsed = JSON.parse(url); return Array.isArray(parsed) ? parsed : [url] }
        catch { return [url] }
    }

    const handleCreateThread = async (e) => {
        e.preventDefault(); if (!newTitle.trim() || !newContent.trim()) return
        try { await createThread({ title: newTitle, content: newContent, author: user?.name || 'Anonymous', user_id: user?.user_id, images: newImages }).unwrap(); setNewTitle(''); setNewContent(''); setNewImages([]); setNewImagePreviews([]); setShowNewForm(false) }
        catch (err) { console.error(err) }
    }
    const handleAddReply = async (e) => {
        e.preventDefault(); if (!replyContent.trim() || !activeThread) return
        try { await addReply({ threadId: activeThread, content: replyContent, author: user?.name || 'Anonymous', user_id: user?.user_id, images: replyImages }).unwrap(); setReplyContent(''); setReplyImages([]); setReplyImagePreviews([]) }
        catch (err) { console.error(err) }
    }
    const handleDeleteThread = async (id) => { if (!confirm('Delete this post and all comments?')) return; try { await deleteThread(id).unwrap(); setActiveThread(null) } catch (e) { console.error(e) } }
    const handleDeleteReply = async (id) => { if (!confirm('Delete this comment?')) return; try { await deleteReply({ threadId: activeThread, replyId: id }).unwrap() } catch (e) { console.error(e) } }
    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
    const timeAgo = (d) => {
        if (!d) return ''
        const s = Math.floor((Date.now() - new Date(d)) / 1000)
        if (s < 60) return 'just now'
        if (s < 3600) return `${Math.floor(s / 60)}m ago`
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`
        if (s < 604800) return `${Math.floor(s / 86400)}d ago`
        return fmt(d)
    }

    /* ── Avatar ── */
    const Avatar = ({ name, size = 'sm' }) => {
        const s = size === 'lg' ? { w: '44px', h: '44px', fs: '15px' } : { w: '36px', h: '36px', fs: '13px' }
        return (
            <div style={{
                width: s.w, height: s.h, borderRadius: '50%', background: '#111', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                fontSize: s.fs, flexShrink: 0, fontFamily: F
            }}>
                {name?.[0]?.toUpperCase() || 'U'}
            </div>
        )
    }

    /* ── Image Previews ── */
    const ImagePreviews = ({ previews, onRemove, setImages, setPreviews }) => (
        previews.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {previews.map((p, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                        <img src={p} alt="" style={{ width: '80px', height: '64px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e5e5e5' }} />
                        <button type="button" onClick={() => onRemove(i, setImages, setPreviews)}
                            style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', background: '#111', color: 'white', border: 'none', borderRadius: '50%', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                ))}
            </div>
        )
    )

    /* ── Render Images ── */
    const RenderImages = ({ images, large }) => {
        const imgs = parseImages(images)
        if (imgs.length === 0) return null
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: large ? '20px' : '12px' }}>
                {imgs.map((img, i) => (
                    <img key={i} src={img} alt=""
                        onClick={() => window.open(img, '_blank')}
                        style={{
                            maxWidth: large ? '100%' : '100%',
                            maxHeight: large ? '500px' : '320px',
                            objectFit: 'contain', borderRadius: '14px', cursor: 'pointer',
                            background: '#fafafa', border: '1px solid #eee',
                            transition: 'transform .2s', width: '100%'
                        }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.01)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                ))}
            </div>
        )
    }

    // ─── NOT AUTHENTICATED ──────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
                <div style={{ textAlign: 'center', padding: '0 24px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#111', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>💬</div>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Discussion Forum</h2>
                    <p style={{ color: '#888', fontSize: '15px', margin: 0 }}>Sign in to join the discussion</p>
                </div>
            </div>
        )
    }

    // ─── THREAD DETAIL ──────────────────────────────────────
    if (activeThread && threadDetail) {
        const score = (threadDetail.UPVOTES || 0) - (threadDetail.DOWNVOTES || 0)
        return (
            <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: F }}>
                <div style={{ maxWidth: '820px', margin: '0 auto', padding: '40px 24px 80px' }}>

                    {/* Back */}
                    <button onClick={() => setActiveThread(null)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#888', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '32px', fontFamily: F, padding: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                        Back to discussions
                    </button>

                    {/* Post Card */}
                    <article style={{ background: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 2px 12px rgba(0,0,0,.04)', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                            <Avatar name={threadDetail.AUTHOR} size="lg" />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 700, color: '#111', fontSize: '15px', margin: '0 0 2px' }}>{threadDetail.AUTHOR}</p>
                                <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>{fmt(threadDetail.CREATED_DATE)}</p>
                            </div>
                            {user?.name === threadDetail.AUTHOR && (
                                <button onClick={() => handleDeleteThread(activeThread)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #eee', borderRadius: '10px', color: '#999', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '8px 14px', fontFamily: F, transition: 'all .2s' }}
                                    onMouseEnter={e => { e.target.style.borderColor = '#fca5a5'; e.target.style.color = '#ef4444' }}
                                    onMouseLeave={e => { e.target.style.borderColor = '#eee'; e.target.style.color = '#999' }}>
                                    <TrashIcon /> Delete
                                </button>
                            )}
                        </div>

                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#111', lineHeight: 1.3, letterSpacing: '-0.5px', margin: '0 0 16px' }}>{threadDetail.TITLE}</h1>
                        <div style={{ color: '#444', fontSize: '15px', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{threadDetail.CONTENT}</div>

                        <RenderImages images={threadDetail.IMAGE_URL} large />

                        {/* Actions Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f6f7f8', borderRadius: '24px', overflow: 'hidden' }}>
                                <button onClick={() => handleVote(activeThread, 'up')}
                                    style={{ padding: '10px 14px', background: userVotes[activeThread] === 'up' ? '#ffe9e0' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', borderRadius: '24px 0 0 24px' }}
                                    onMouseEnter={e => { if (userVotes[activeThread] !== 'up') e.target.style.background = '#f0f0f0' }}
                                    onMouseLeave={e => { if (userVotes[activeThread] !== 'up') e.target.style.background = 'transparent' }}>
                                    <UpArrow active={userVotes[activeThread] === 'up'} />
                                </button>
                                <span style={{ padding: '0 6px', fontSize: '14px', fontWeight: 800, color: userVotes[activeThread] === 'up' ? '#ff4500' : userVotes[activeThread] === 'down' ? '#7193ff' : '#1a1a1b', fontFamily: F, minWidth: '28px', textAlign: 'center' }}>{score}</span>
                                <button onClick={() => handleVote(activeThread, 'down')}
                                    style={{ padding: '10px 14px', background: userVotes[activeThread] === 'down' ? '#dde5ff' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', borderRadius: '0 24px 24px 0' }}
                                    onMouseEnter={e => { if (userVotes[activeThread] !== 'down') e.target.style.background = '#f0f0f0' }}
                                    onMouseLeave={e => { if (userVotes[activeThread] !== 'down') e.target.style.background = 'transparent' }}>
                                    <DownArrow active={userVotes[activeThread] === 'down'} />
                                </button>
                            </div>
                            <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f6f7f8', border: 'none', borderRadius: '24px', padding: '10px 16px', color: '#888', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: F, transition: 'background .15s' }}
                                onMouseEnter={e => e.target.style.background = '#eee'}
                                onMouseLeave={e => e.target.style.background = '#f6f7f8'}>
                                <ChatIcon /> {threadDetail.replies?.length || 0} comments
                            </button>
                        </div>
                    </article>

                    {/* Comments Section */}
                    <div style={{ marginTop: '32px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            💬 Comments <span style={{ color: '#bbb', fontWeight: 500 }}>({threadDetail.replies?.length || 0})</span>
                        </h2>

                        {(!threadDetail.replies || threadDetail.replies.length === 0) ? (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: '#ccc', fontSize: '14px', background: 'white', borderRadius: '16px', border: '1px solid #eee' }}>
                                No comments yet — be the first to reply.
                            </div>
                        ) : (
                            <div>
                                {threadDetail.replies.map((r, i) => (
                                    <div key={r.REPLY_ID || i} style={{
                                        background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '12px',
                                        border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,.02)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                            <Avatar name={r.AUTHOR} />
                                            <span style={{ fontWeight: 700, color: '#111', fontSize: '13px' }}>{r.AUTHOR}</span>
                                            <span style={{ color: '#bbb', fontSize: '12px' }}>{timeAgo(r.CREATED_DATE)}</span>
                                            {user?.name === r.AUTHOR && (
                                                <button onClick={() => handleDeleteReply(r.REPLY_ID)}
                                                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', transition: 'color .2s' }}
                                                    onMouseEnter={e => e.target.style.color = '#ef4444'}
                                                    onMouseLeave={e => e.target.style.color = '#ccc'}>
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </div>
                                        <p style={{ color: '#444', fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{r.CONTENT}</p>
                                        <RenderImages images={r.IMAGE_URL} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reply Form */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginTop: '20px', border: '1px solid #eee' }}>
                        <form onSubmit={handleAddReply}>
                            <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a comment…" rows={3} required
                                style={{
                                    width: '100%', padding: '14px 16px', border: '1.5px solid #e5e5e5', borderRadius: '14px',
                                    fontSize: '14px', resize: 'none', fontFamily: F, color: '#111', background: '#fafafa',
                                    outline: 'none', transition: 'border-color .2s, box-shadow .2s', boxSizing: 'border-box'
                                }}
                                onFocus={e => { e.target.style.borderColor = '#111'; e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,.06)' }}
                                onBlur={e => { e.target.style.borderColor = '#e5e5e5'; e.target.style.boxShadow = 'none' }} />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                                <div>
                                    <input type="file" ref={replyImageRef} accept="image/*" style={{ display: 'none' }}
                                        onChange={(e) => handleImageSelect(e, setReplyImages, setReplyImagePreviews, replyImages)} />
                                    <button type="button" onClick={() => replyImageRef.current?.click()}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#999', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
                                        <ImageIcon /> Attach image
                                    </button>
                                    <ImagePreviews previews={replyImagePreviews} onRemove={removeImage} setImages={setReplyImages} setPreviews={setReplyImagePreviews} />
                                </div>
                                <button type="submit" disabled={replying || !replyContent.trim()}
                                    style={{
                                        background: '#111', color: 'white', fontSize: '13px', fontWeight: 700, padding: '10px 24px',
                                        borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: F,
                                        opacity: (replying || !replyContent.trim()) ? .3 : 1, transition: 'all .2s',
                                        boxShadow: '0 4px 14px rgba(0,0,0,.15)'
                                    }}>
                                    {replying ? 'Posting…' : 'Reply'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    // ─── THREAD LIST ────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: F }}>
            <div style={{ maxWidth: '820px', margin: '0 auto', padding: '40px 24px 80px' }}>

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '32px', paddingBottom: '28px', borderBottom: '1px solid #eee'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '16px', background: '#111',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                            boxShadow: '0 6px 20px rgba(0,0,0,.2)'
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#111', margin: 0, letterSpacing: '-0.5px', lineHeight: 1.1 }}>Discussion Forum</h1>
                            <p style={{ color: '#999', fontSize: '13px', margin: '4px 0 0', fontWeight: 500 }}>
                                {threads.length} discussion{threads.length !== 1 ? 's' : ''} · Ask questions & share ideas
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setShowNewForm(!showNewForm)}
                        style={{
                            fontSize: '13px', fontWeight: 700, padding: '12px 28px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontFamily: F,
                            background: showNewForm ? '#f5f5f5' : 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
                            color: showNewForm ? '#666' : 'white', letterSpacing: '0.3px',
                            boxShadow: showNewForm ? 'none' : '0 8px 28px rgba(15,52,96,.35), 0 2px 8px rgba(0,0,0,.15)',
                            transition: 'all .3s cubic-bezier(.4,0,.2,1)', transform: 'scale(1)'
                        }}
                        onMouseEnter={e => { if (!showNewForm) { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 12px 36px rgba(15,52,96,.45), 0 4px 12px rgba(0,0,0,.2)' }}}
                        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; if (!showNewForm) e.target.style.boxShadow = '0 8px 28px rgba(15,52,96,.35), 0 2px 8px rgba(0,0,0,.15)' }}>
                        {showNewForm ? '✕ Cancel' : '+ New Post'}
                    </button>
                </div>

                {/* Create Form */}
                {showNewForm && (
                    <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '20px', padding: '28px', marginBottom: '28px', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111', margin: '0 0 20px' }}>Create a post</h3>
                        <form onSubmit={handleCreateThread}>
                            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Title" required
                                style={{
                                    width: '100%', padding: '14px 16px', border: '1.5px solid #e5e5e5', borderRadius: '14px',
                                    fontSize: '15px', fontWeight: 600, fontFamily: F, color: '#111', background: '#fafafa',
                                    outline: 'none', marginBottom: '12px', boxSizing: 'border-box', transition: 'border-color .2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#111'}
                                onBlur={e => e.target.style.borderColor = '#e5e5e5'} />
                            <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Share your thoughts…" rows={5} required
                                style={{
                                    width: '100%', padding: '14px 16px', border: '1.5px solid #e5e5e5', borderRadius: '14px',
                                    fontSize: '14px', resize: 'none', fontFamily: F, color: '#111', background: '#fafafa',
                                    outline: 'none', marginBottom: '12px', boxSizing: 'border-box', transition: 'border-color .2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#111'}
                                onBlur={e => e.target.style.borderColor = '#e5e5e5'} />

                            <div style={{ marginBottom: '20px' }}>
                                <input type="file" ref={threadImageRef} accept="image/*" multiple style={{ display: 'none' }}
                                    onChange={(e) => handleImageSelect(e, setNewImages, setNewImagePreviews, newImages)} />
                                <button type="button" onClick={() => threadImageRef.current?.click()}
                                    disabled={newImages.length >= 5}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #e5e5e5', borderRadius: '10px', color: '#888', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '8px 16px', fontFamily: F, opacity: newImages.length >= 5 ? .4 : 1 }}>
                                    <ImageIcon /> Attach images ({newImages.length}/5)
                                </button>
                                <ImagePreviews previews={newImagePreviews} onRemove={removeImage} setImages={setNewImages} setPreviews={setNewImagePreviews} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button"
                                    onClick={() => { setShowNewForm(false); setNewTitle(''); setNewContent(''); setNewImages([]); setNewImagePreviews([]) }}
                                    style={{ padding: '10px 20px', background: 'none', border: '1px solid #e5e5e5', borderRadius: '12px', color: '#888', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={creating}
                                    style={{
                                        padding: '10px 28px', background: '#111', color: 'white', border: 'none', borderRadius: '12px',
                                        fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: F,
                                        opacity: creating ? .3 : 1, boxShadow: '0 4px 14px rgba(0,0,0,.15)'
                                    }}>
                                    {creating ? 'Posting…' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e5e5', borderTop: '3px solid #111', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                    </div>
                ) : threads.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: '20px', border: '1px solid #eee' }}>
                        <p style={{ fontSize: '40px', margin: '0 0 8px', opacity: .3 }}>💬</p>
                        <p style={{ color: '#bbb', fontSize: '15px', fontWeight: 600, margin: '0 0 4px' }}>No discussions yet.</p>
                        <p style={{ color: '#ccc', fontSize: '13px', margin: 0 }}>Be the first to start one!</p>
                    </div>
                ) : (
                    <div>
                        {threads.map((t) => {
                            const score = (t.UPVOTES || 0) - (t.DOWNVOTES || 0)
                            const imgs = parseImages(t.IMAGE_URL)
                            return (
                                <div key={t.THREAD_ID}
                                    onClick={() => setActiveThread(t.THREAD_ID)}
                                    style={{
                                        background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '14px',
                                        border: '1px solid #eee', cursor: 'pointer', transition: 'all .25s',
                                        boxShadow: '0 2px 8px rgba(0,0,0,.03)'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.03)'; e.currentTarget.style.transform = 'translateY(0)' }}>

                                    {/* Author */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                        <Avatar name={t.AUTHOR} />
                                        <span style={{ fontWeight: 600, color: '#444', fontSize: '13px' }}>{t.AUTHOR}</span>
                                        <span style={{ color: '#bbb', fontSize: '12px' }}>· {timeAgo(t.CREATED_DATE)}</span>
                                    </div>

                                    {/* Title */}
                                    <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#111', lineHeight: 1.35, margin: '0 0 8px', letterSpacing: '-0.3px' }}>
                                        {t.TITLE}
                                    </h3>

                                    {/* Preview */}
                                    <p style={{ color: '#777', fontSize: '14px', lineHeight: 1.6, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {t.CONTENT}
                                    </p>

                                    {/* Images (bigger) */}
                                    {imgs.length > 0 && (
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                            {imgs.map((img, idx) => (
                                                <img key={idx} src={img} alt=""
                                                    style={{
                                                        width: '100%', maxHeight: '320px', objectFit: 'cover',
                                                        borderRadius: '14px', border: '1px solid #eee', background: '#fafafa'
                                                    }} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Bottom Bar — Reddit Style */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                                        {/* Votes Pill */}
                                        <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f6f7f8', borderRadius: '24px', overflow: 'hidden' }}>
                                            <button onClick={() => handleVote(t.THREAD_ID, 'up')}
                                                style={{ padding: '8px 10px', background: userVotes[t.THREAD_ID] === 'up' ? '#ffe9e0' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', borderRadius: '24px 0 0 24px' }}
                                                onMouseEnter={e => { if (userVotes[t.THREAD_ID] !== 'up') e.target.style.background = '#eee' }}
                                                onMouseLeave={e => { if (userVotes[t.THREAD_ID] !== 'up') e.target.style.background = 'transparent' }}>
                                                <UpArrow active={userVotes[t.THREAD_ID] === 'up'} />
                                            </button>
                                            <span style={{ padding: '0 4px', fontSize: '13px', fontWeight: 800, color: userVotes[t.THREAD_ID] === 'up' ? '#ff4500' : userVotes[t.THREAD_ID] === 'down' ? '#7193ff' : '#1a1a1b', fontFamily: F, minWidth: '24px', textAlign: 'center' }}>{score}</span>
                                            <button onClick={() => handleVote(t.THREAD_ID, 'down')}
                                                style={{ padding: '8px 10px', background: userVotes[t.THREAD_ID] === 'down' ? '#dde5ff' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', borderRadius: '0 24px 24px 0' }}
                                                onMouseEnter={e => { if (userVotes[t.THREAD_ID] !== 'down') e.target.style.background = '#eee' }}
                                                onMouseLeave={e => { if (userVotes[t.THREAD_ID] !== 'down') e.target.style.background = 'transparent' }}>
                                                <DownArrow active={userVotes[t.THREAD_ID] === 'down'} />
                                            </button>
                                        </div>

                                        {/* Comments Pill */}
                                        <button onClick={() => setActiveThread(t.THREAD_ID)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f6f7f8', border: 'none', borderRadius: '24px', padding: '8px 14px', color: '#878a8c', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: F, transition: 'background .15s' }}
                                            onMouseEnter={e => e.target.style.background = '#eee'}
                                            onMouseLeave={e => e.target.style.background = '#f6f7f8'}>
                                            <ChatIcon /> {t.REPLY_COUNT || 0} Comments
                                        </button>

                                        {/* Share Pill */}
                                        <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/forum?thread=' + t.THREAD_ID); alert('Link copied!') }}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f6f7f8', border: 'none', borderRadius: '24px', padding: '8px 14px', color: '#878a8c', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: F, transition: 'background .15s' }}
                                            onMouseEnter={e => e.target.style.background = '#eee'}
                                            onMouseLeave={e => e.target.style.background = '#f6f7f8'}>
                                            <LinkIcon /> Share
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Forum
