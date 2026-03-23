// Forum Page — Clean Premium B&W Redesign
// Tailwind CSS · Inter font · Black & White · All features preserved
import { useState, useRef } from 'react'
import useAuth from '../hooks/useAuth'
import {
    useGetThreadsQuery,
    useGetThreadQuery,
    useCreateThreadMutation,
    useAddReplyMutation,
    useUpvoteThreadMutation,
    useDownvoteThreadMutation,
    useDeleteThreadMutation,
    useDeleteReplyMutation,
} from '../store/api/forumApi'

/* ─── Outline Icons ─────────────────────────────────────── */
const ChevronUp = ({ active }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? '#171717' : '#a3a3a3'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
    </svg>
)
const ChevronDown = ({ active }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? '#171717' : '#a3a3a3'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
)
const ChatIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
)
const LinkIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
)
const ImageIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
)
const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
)

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
    const [createThread, { isLoading: creating }] = useCreateThreadMutation()
    const [addReply, { isLoading: replying }] = useAddReplyMutation()
    const [upvoteThread] = useUpvoteThreadMutation()
    const [downvoteThread] = useDownvoteThreadMutation()
    const [deleteThread] = useDeleteThreadMutation()
    const [deleteReply] = useDeleteReplyMutation()

    /* ── helpers ─────────────────────────────────────────── */
    const handleImageSelect = (e, setImages, setPreviews, currentImages) => {
        const files = Array.from(e.target.files)
        if (currentImages.length + files.length > 5) { alert('Maximum 5 images allowed'); return }
        const vf = [], vp = []
        for (const f of files) { if (f.size > 5e6) { alert(`"${f.name}" exceeds 5 MB`); continue }; vf.push(f); vp.push(URL.createObjectURL(f)) }
        setImages(p => [...p, ...vf]); setPreviews(p => [...p, ...vp]); e.target.value = ''
    }
    const removeImage = (i, setI, setP) => { setI(p => p.filter((_, x) => x !== i)); setP(p => p.filter((_, x) => x !== i)) }
    const handleVote = (id, dir) => { if (userVotes[id] === dir) return; dir === 'up' ? upvoteThread(id) : downvoteThread(id); setUserVotes(p => ({ ...p, [id]: dir })) }

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

    /* ── avatar ──────────────────────────────────────────── */
    const Avatar = ({ name, size = 'sm' }) => {
        const dim = size === 'lg' ? 'w-10 h-10 text-[13px]' : 'w-8 h-8 text-[11px]'
        return (
            <div className={`${dim} rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold shrink-0`}>
                {name?.[0]?.toUpperCase() || 'U'}
            </div>
        )
    }

    /* ── image previews ──────────────────────────────────── */
    const ImagePreviews = ({ previews, onRemove, setImages, setPreviews }) => (
        previews.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
                {previews.map((p, i) => (
                    <div key={i} className="relative group">
                        <img src={p} alt="" className="w-[72px] h-[56px] object-cover rounded-lg border border-neutral-200" />
                        <button type="button" onClick={() => onRemove(i, setImages, setPreviews)}
                            className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-neutral-900 text-white rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                ))}
            </div>
        )
    )

    // ─── NOT AUTHENTICATED ──────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                <div className="text-center px-6">
                    <h2 className="text-[28px] font-bold text-neutral-900 mb-2 tracking-tight">Forum</h2>
                    <p className="text-neutral-500 text-[15px]">Sign in to join the discussion</p>
                </div>
            </div>
        )
    }

    // ─── THREAD DETAIL ──────────────────────────────────────
    if (activeThread && threadDetail) {
        const score = (threadDetail.UPVOTES || 0) - (threadDetail.DOWNVOTES || 0)
        return (
            <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

                {/* Thin top accent */}
                <div className="h-[3px] bg-neutral-900" />

                <div className="max-w-[760px] mx-auto px-5 pt-8 pb-20">

                    {/* Back */}
                    <button onClick={() => setActiveThread(null)}
                        className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-900 text-[13px] font-medium mb-8 transition-colors group">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-0.5 transition-transform"><polyline points="15 18 9 12 15 6" /></svg>
                        All discussions
                    </button>

                    {/* Post */}
                    <article>
                        <div className="flex items-center gap-3 mb-5">
                            <Avatar name={threadDetail.AUTHOR} size="lg" />
                            <div>
                                <p className="font-semibold text-neutral-900 text-[14px] leading-none mb-1">{threadDetail.AUTHOR}</p>
                                <p className="text-neutral-400 text-[12px]">{fmt(threadDetail.CREATED_DATE)}</p>
                            </div>
                            {user?.name === threadDetail.AUTHOR && (
                                <button onClick={() => handleDeleteThread(activeThread)}
                                    className="ml-auto flex items-center gap-1.5 text-neutral-400 hover:text-red-500 text-[12px] font-medium transition-colors">
                                    <TrashIcon /> Delete
                                </button>
                            )}
                        </div>

                        <h1 className="text-[24px] font-bold text-neutral-900 leading-[1.3] tracking-tight mb-4">{threadDetail.TITLE}</h1>
                        <div className="text-neutral-600 text-[15px] leading-[1.75] whitespace-pre-wrap">{threadDetail.CONTENT}</div>

                        {threadDetail.IMAGE_URL && (
                            <img src={threadDetail.IMAGE_URL} alt=""
                                className="mt-6 w-full max-h-[420px] object-contain bg-neutral-50 rounded-xl cursor-pointer border border-neutral-100"
                                onClick={() => window.open(threadDetail.IMAGE_URL, '_blank')} />
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-neutral-100">
                            <div className="inline-flex items-center border border-neutral-200 rounded-full divide-x divide-neutral-200">
                                <button onClick={() => handleVote(activeThread, 'up')}
                                    className={`px-2.5 py-1.5 rounded-l-full transition-colors hover:bg-neutral-50 ${userVotes[activeThread] === 'up' ? 'bg-neutral-100' : ''}`}>
                                    <ChevronUp active={userVotes[activeThread] === 'up'} />
                                </button>
                                <span className="px-3 text-[13px] font-semibold text-neutral-900 tabular-nums">{score}</span>
                                <button onClick={() => handleVote(activeThread, 'down')}
                                    className={`px-2.5 py-1.5 rounded-r-full transition-colors hover:bg-neutral-50 ${userVotes[activeThread] === 'down' ? 'bg-neutral-100' : ''}`}>
                                    <ChevronDown active={userVotes[activeThread] === 'down'} />
                                </button>
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-neutral-500 text-[13px] font-medium">
                                <ChatIcon /> {threadDetail.replies?.length || 0} comments
                            </span>
                        </div>
                    </article>

                    {/* Divider */}
                    <div className="border-t border-neutral-100 mt-8 mb-8" />

                    {/* Comments */}
                    <section>
                        <h2 className="text-[15px] font-semibold text-neutral-900 mb-6">
                            Comments <span className="text-neutral-400 font-normal">({threadDetail.replies?.length || 0})</span>
                        </h2>

                        {(!threadDetail.replies || threadDetail.replies.length === 0) ? (
                            <p className="text-neutral-400 text-center py-10 text-[14px]">No comments yet — be the first to reply.</p>
                        ) : (
                            <div className="space-y-0">
                                {threadDetail.replies.map((r, i) => (
                                    <div key={r.REPLY_ID || i} className={`py-5 ${i > 0 ? 'border-t border-neutral-100' : ''}`}>
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <Avatar name={r.AUTHOR} />
                                            <span className="font-semibold text-neutral-900 text-[13px]">{r.AUTHOR}</span>
                                            <span className="text-neutral-400 text-[12px]">{timeAgo(r.CREATED_DATE)}</span>
                                            {user?.name === r.AUTHOR && (
                                                <button onClick={() => handleDeleteReply(r.REPLY_ID)}
                                                    className="ml-auto text-neutral-400 hover:text-red-500 transition-colors"><TrashIcon /></button>
                                            )}
                                        </div>
                                        <p className="text-neutral-600 text-[14px] leading-[1.7] whitespace-pre-wrap pl-[38px]">{r.CONTENT}</p>
                                        {r.IMAGE_URL && (
                                            <img src={r.IMAGE_URL} alt=""
                                                className="ml-[38px] mt-3 max-w-sm w-full rounded-lg border border-neutral-100 cursor-pointer"
                                                onClick={() => window.open(r.IMAGE_URL, '_blank')} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Reply Form */}
                    <div className="border-t border-neutral-100 mt-6 pt-6">
                        <form onSubmit={handleAddReply}>
                            <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a comment…"
                                rows={3} required
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-300 transition-shadow bg-white" />

                            <div className="flex items-center justify-between mt-3">
                                <div>
                                    <input type="file" ref={replyImageRef} accept="image/*" className="hidden"
                                        onChange={(e) => handleImageSelect(e, setReplyImages, setReplyImagePreviews, replyImages)} />
                                    <button type="button" onClick={() => replyImageRef.current?.click()}
                                        className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-700 text-[13px] font-medium transition-colors">
                                        <ImageIcon /> Attach image
                                    </button>
                                    <ImagePreviews previews={replyImagePreviews} onRemove={removeImage} setImages={setReplyImages} setPreviews={setReplyImagePreviews} />
                                </div>
                                <button type="submit" disabled={replying || !replyContent.trim()}
                                    className="bg-neutral-900 hover:bg-black text-white text-[13px] font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
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
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* Thin top accent */}
            <div className="h-[3px] bg-neutral-900" />

            <div className="max-w-[760px] mx-auto px-5 pt-10 pb-20">

                {/* Header — clean inline */}
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-neutral-100">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-neutral-900 flex items-center justify-center text-white">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-[22px] font-bold text-neutral-900 tracking-tight leading-none">Discussion Forum</h1>
                            <p className="text-neutral-400 text-[13px] mt-1">{threads.length} discussion{threads.length !== 1 ? 's' : ''} · Ask questions & share ideas</p>
                        </div>
                    </div>
                    <button onClick={() => setShowNewForm(!showNewForm)}
                        className={`text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors ${showNewForm
                            ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            : 'bg-neutral-900 text-white hover:bg-black'
                            }`}>
                        {showNewForm ? 'Cancel' : '+ New Post'}
                    </button>
                </div>

                {/* Create Form */}
                {showNewForm && (
                    <div className="border border-neutral-200 rounded-xl p-6 mb-8">
                        <h3 className="text-[16px] font-semibold text-neutral-900 mb-5">Create a post</h3>
                        <form onSubmit={handleCreateThread}>
                            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Title" required
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-300 mb-3 bg-white" />
                            <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Share your thoughts…" rows={5} required
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-300 mb-3 bg-white" />

                            <div className="mb-5">
                                <input type="file" ref={threadImageRef} accept="image/*" multiple className="hidden"
                                    onChange={(e) => handleImageSelect(e, setNewImages, setNewImagePreviews, newImages)} />
                                <button type="button" onClick={() => threadImageRef.current?.click()}
                                    disabled={newImages.length >= 5}
                                    className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-700 text-[13px] font-medium transition-colors disabled:opacity-30">
                                    <ImageIcon /> Attach images ({newImages.length}/5)
                                </button>
                                <ImagePreviews previews={newImagePreviews} onRemove={removeImage} setImages={setNewImages} setPreviews={setNewImagePreviews} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button"
                                    onClick={() => { setShowNewForm(false); setNewTitle(''); setNewContent(''); setNewImages([]); setNewImagePreviews([]) }}
                                    className="text-neutral-500 hover:text-neutral-700 text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-neutral-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={creating}
                                    className="bg-neutral-900 hover:bg-black text-white text-[13px] font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-25">
                                    {creating ? 'Posting…' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List */}
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full mx-auto" />
                    </div>
                ) : threads.length === 0 ? (
                    <div className="text-center py-20 border border-neutral-200 rounded-xl">
                        <p className="text-neutral-400 text-[15px]">No discussions yet.</p>
                        <p className="text-neutral-400 text-[13px] mt-1">Be the first to start one!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {threads.map((t) => {
                            const score = (t.UPVOTES || 0) - (t.DOWNVOTES || 0)
                            return (
                                <div key={t.THREAD_ID}
                                    className="py-6 cursor-pointer group"
                                    onClick={() => setActiveThread(t.THREAD_ID)}>

                                    {/* Author & time */}
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <Avatar name={t.AUTHOR} />
                                        <span className="font-medium text-neutral-600 text-[13px]">{t.AUTHOR}</span>
                                        <span className="text-neutral-400 text-[12px]">{timeAgo(t.CREATED_DATE)}</span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-[17px] font-semibold text-neutral-900 leading-snug mb-1.5 group-hover:text-neutral-600 transition-colors">
                                        {t.TITLE}
                                    </h3>

                                    {/* Preview */}
                                    <p className="text-neutral-500 text-[14px] leading-relaxed line-clamp-2 mb-3">{t.CONTENT}</p>

                                    {/* Image */}
                                    {t.IMAGE_URL && (
                                        <img src={t.IMAGE_URL} alt=""
                                            className="w-full max-h-[200px] object-contain bg-neutral-50 rounded-xl border border-neutral-100 mb-3" />
                                    )}

                                    {/* Bottom bar */}
                                    <div className="flex items-center gap-3 text-neutral-400" onClick={(e) => e.stopPropagation()}>
                                        {/* Votes */}
                                        <div className="inline-flex items-center border border-neutral-200 rounded-full divide-x divide-neutral-200">
                                            <button onClick={() => handleVote(t.THREAD_ID, 'up')}
                                                className={`px-2 py-1 rounded-l-full transition-colors hover:bg-neutral-50 ${userVotes[t.THREAD_ID] === 'up' ? 'bg-neutral-100' : ''}`}>
                                                <ChevronUp active={userVotes[t.THREAD_ID] === 'up'} />
                                            </button>
                                            <span className="px-2.5 text-[12px] font-semibold text-neutral-900 tabular-nums">{score}</span>
                                            <button onClick={() => handleVote(t.THREAD_ID, 'down')}
                                                className={`px-2 py-1 rounded-r-full transition-colors hover:bg-neutral-50 ${userVotes[t.THREAD_ID] === 'down' ? 'bg-neutral-100' : ''}`}>
                                                <ChevronDown active={userVotes[t.THREAD_ID] === 'down'} />
                                            </button>
                                        </div>

                                        {/* Comments */}
                                        <button onClick={() => setActiveThread(t.THREAD_ID)}
                                            className="inline-flex items-center gap-1.5 text-[12px] font-medium hover:text-neutral-700 transition-colors">
                                            <ChatIcon /> {t.REPLY_COUNT || 0}
                                        </button>

                                        {/* Share */}
                                        <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/forum?thread=' + t.THREAD_ID); alert('Link copied!') }}
                                            className="inline-flex items-center gap-1.5 text-[12px] font-medium hover:text-neutral-700 transition-colors">
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
