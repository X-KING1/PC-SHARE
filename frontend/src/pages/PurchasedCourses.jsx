// Purchased Courses Page — Premium Blue/Black/White Redesign
// Video player, quizzes, live sessions, course grid · Inter font
import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { useGetUserPaymentsQuery } from '../store/api/paymentApi'
import { useGetCoursesQuery, useGetRecommendationsQuery, useRateCourseMutation, useGetUserRatingQuery, useGetCourseCommentsQuery, useAddCourseCommentMutation, useDeleteCourseCommentMutation } from '../store/api/courseApi'
import { useGetQuizzesQuery, useGetCompletedQuizzesQuery } from '../store/api/quizApi'
import CourseCardComponent from '../components/CourseCard'
import { getVideoId, getThumbnail } from '../utils/youtube'
import YouTubePlayer from '../components/YouTubePlayer'
import VideoMeeting from '../components/VideoMeeting'
import { useGetCourseSessionsQuery, useBookSessionMutation } from '../store/api/sessionApi'

/* ─── Icons ──────────────────────────────────────────── */
const PlayIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
)
const ChevronIcon = ({ open }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>
        <polyline points="9 18 15 12 9 6" />
    </svg>
)
const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)
const CalIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)
const ClockIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
)
const StarRatingIcon = ({ filled, hovered }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#2563eb' : hovered ? '#93c5fd' : 'none'} stroke={filled ? '#2563eb' : '#cbd5e1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)

const PurchasedCourses = () => {
    const { user, isAuthenticated } = useAuth()
    const [searchParams] = useSearchParams()
    const [activeVideo, setActiveVideo] = useState(null)
    const [showQuizzes, setShowQuizzes] = useState(false)
    const [expandedModule, setExpandedModule] = useState(-1)
    const [showSessions, setShowSessions] = useState(false)
    const [activeBookedSession, setActiveBookedSession] = useState(null)
    const [userRating, setUserRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [ratingSubmitted, setRatingSubmitted] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [localComments, setLocalComments] = useState([])
    const [showComments, setShowComments] = useState(false)

    const { data: payments = [], isLoading: paymentsLoading } = useGetUserPaymentsQuery(user?.user_id, { skip: !user?.user_id })
    const { data: coursesData } = useGetCoursesQuery({ page: 1, limit: 200 })
    const [rateCourse] = useRateCourseMutation()
    const [addCourseComment] = useAddCourseCommentMutation()
    const [deleteCourseComment] = useDeleteCourseCommentMutation()
    const { data: recommendations = {} } = useGetRecommendationsQuery(activeVideo?.course_id, { skip: !activeVideo?.course_id })
    const { data: existingRating } = useGetUserRatingQuery(
        { userId: user?.user_id, courseId: activeVideo?.course_id },
        { skip: !user?.user_id || !activeVideo?.course_id }
    )
    const { data: apiComments = [], isError: commentsError } = useGetCourseCommentsQuery(activeVideo?.course_id, { skip: !activeVideo?.course_id })
    // Merge API comments with local-only comments (local ones show instantly while API syncs)
    const courseComments = commentsError ? localComments : [...apiComments, ...localComments.filter(lc => !apiComments.some(ac => ac.text === lc.text && ac.user_id === lc.user_id))]
    const allCourses = coursesData?.courses || []
    const { data: quizzes = [] } = useGetQuizzesQuery(activeVideo?.course_id, { skip: !activeVideo?.course_id })
    const { data: completedQuizIds = [] } = useGetCompletedQuizzesQuery(user?.user_id, { skip: !user?.user_id })
    const { data: sessions = [], refetch: refetchSessions } = useGetCourseSessionsQuery(activeVideo?.course_id, { skip: !activeVideo?.course_id })
    const [bookSession] = useBookSessionMutation()

    const handleBook = async (sessionId) => {
        try {
            await bookSession({ id: sessionId, student_id: user.user_id, student_name: user.name || user.username || 'Student' }).unwrap()
            refetchSessions()
        } catch { alert('Failed to book') }
    }

    const closePlayer = () => { setActiveVideo(null); setShowQuizzes(false); setExpandedModule(-1); setShowSessions(false); setActiveBookedSession(null); setUserRating(0); setRatingSubmitted(false) }

    // Sync existing rating when video changes
    useEffect(() => {
        if (existingRating) {
            setUserRating(existingRating)
            setRatingSubmitted(false)
        } else {
            setUserRating(0)
            setRatingSubmitted(false)
        }
    }, [existingRating, activeVideo?.course_id])

    const availableSessions = sessions.filter(s => s.status === 'available')
    const myBookedSessions = sessions.filter(s => s.status === 'booked' && s.student_id === user?.user_id)

    const modules = useMemo(() => {
        if (!quizzes.length) return []
        const names = ["Getting Started", "Core Concepts", "Advanced Topics", "Final Project"]
        const grouped = []
        for (let i = 0; i < quizzes.length; i += 3) {
            grouped.push({ name: names[grouped.length] || `Module ${grouped.length + 1}`, items: quizzes.slice(i, i + 3) })
        }
        return grouped
    }, [quizzes])

    const purchasedCourses = payments.map(p => {
        const d = allCourses.find(c => c.course_id === p.course_id)
        return { ...p, ...d, payment_date: p.created_date }
    }).filter(c => c.title)

    useEffect(() => {
        const playId = searchParams.get('play')
        if (playId && purchasedCourses.length > 0 && !activeVideo) {
            const course = purchasedCourses.find(c => String(c.course_id) === playId)
            if (course) setActiveVideo(course)
        }
    }, [searchParams, purchasedCourses])

    // ── Not authenticated ───
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                <div className="text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
                    </div>
                    <h2 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">My Courses</h2>
                    <p className="text-slate-500 text-[15px]">Sign in to watch your courses</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ── Hero ── */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white">
                <div className="max-w-[1400px] mx-auto px-4 pt-10 pb-8">
                    <div className="flex items-start justify-between flex-wrap gap-6">
                        {/* Left: Greeting + Stats */}
                        <div>
                            <h1 className="text-[30px] font-bold text-white tracking-tight leading-tight">
                                Keep going,<br />{user?.name?.split(' ')[0] || 'Learner'}!
                            </h1>
                            <div className="flex items-center gap-3 mt-4">
                                <span className="flex items-center gap-1.5 text-[13px] text-blue-100 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg font-medium">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                                    </svg>
                                    {purchasedCourses.length} {purchasedCourses.length === 1 ? 'course' : 'courses'}
                                </span>
                                <span className="flex items-center gap-1.5 text-[13px] text-blue-100 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg font-medium">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                                    </svg>
                                    {[...new Set(purchasedCourses.map(p => p.category).filter(Boolean))].length} categories
                                </span>
                                {purchasedCourses.length > 0 && (
                                    <span className="flex items-center gap-1.5 text-[13px] text-emerald-300 bg-emerald-500/20 backdrop-blur px-3 py-1.5 rounded-lg font-semibold">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        Active
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right: Weekly Activity */}
                        <div className="text-right">
                            <p className="text-[11px] text-blue-200/70 font-medium uppercase tracking-wider mb-2.5">This week</p>
                            <div className="flex items-center gap-1.5">
                                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, i) => {
                                    const today = new Date().getDay()
                                    const dayIdx = i === 6 ? 0 : i + 1
                                    const isToday = dayIdx === today
                                    const isPast = dayIdx < today || (today === 0 && i < 6)
                                    return (
                                        <div key={day} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-colors ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' :
                                            isPast ? 'bg-white/15 text-white' :
                                                'bg-white/5 text-blue-200/40'
                                            }`}>
                                            {isPast && !isToday ? (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            ) : day}
                                        </div>
                                    )
                                })}
                            </div>
                            <p className="text-[11px] text-blue-200/50 mt-2">{purchasedCourses.length} courses in progress</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 py-8">

                {/* ── Active Video Player (2-column layout) ── */}
                {activeVideo && (
                    <div className="mb-12">
                        {/* Player header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-[12px] text-blue-600 font-semibold uppercase tracking-wider mb-1">Now Playing</p>
                                <h2 className="text-[22px] font-bold text-slate-900 leading-snug">{activeVideo.title}</h2>
                            </div>
                            <button onClick={closePlayer}
                                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-900 text-[13px] font-medium border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-lg transition-colors">
                                <XIcon /> Close
                            </button>
                        </div>

                        {/* 2-column: Video + Sidebar */}
                        <div className="flex gap-5 items-start">
                            {/* LEFT: Video Player */}
                            <div className="flex-1 min-w-0">
                                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg shadow-slate-200/50">
                                    <YouTubePlayer videoUrl={activeVideo.youtube_url} title={activeVideo.title} />
                                </div>
                                {/* Meta tags */}
                                <div className="flex items-center gap-2 mt-4">
                                    <span className="text-[12px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">{activeVideo.instructor}</span>
                                    <span className="text-[12px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">{activeVideo.category}</span>
                                    <span className="text-[12px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">{activeVideo.level}</span>
                                </div>

                                {/* Video Meeting (full-width under video when active) */}
                                {activeBookedSession && (
                                    <div className="border border-neutral-200 rounded-xl p-4 mt-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                <h4 className="text-[14px] font-semibold text-neutral-900">Live: {activeBookedSession.title}</h4>
                                            </div>
                                            <button onClick={() => setActiveBookedSession(null)}
                                                className="flex items-center gap-1 text-neutral-400 hover:text-red-500 text-[12px] font-medium transition-colors">
                                                <XIcon /> Leave
                                            </button>
                                        </div>
                                        <VideoMeeting
                                            userName={user?.name || user?.username || ''}
                                            defaultRoom={activeBookedSession.room_id}
                                            defaultRole="student"
                                            onClose={() => setActiveBookedSession(null)}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* RIGHT: Sidebar — Quizzes + Sessions */}
                            <div className="w-[340px] flex-shrink-0 hidden lg:block">
                                <div className="border border-slate-200 rounded-xl overflow-hidden sticky top-4 shadow-sm bg-white">

                                    {/* ── Quizzes Section ── */}
                                    <button onClick={() => { setShowQuizzes(!showQuizzes); setExpandedModule(-1) }}
                                        className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold transition-colors">
                                        <span className="flex items-center gap-2.5">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                                            </svg>
                                            Quizzes
                                        </span>
                                        <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded">{quizzes.length}</span>
                                    </button>

                                    {showQuizzes && quizzes.length > 0 && (
                                        <div className="divide-y divide-neutral-100">
                                            {modules.map((mod, idx) => (
                                                <div key={idx}>
                                                    <button onClick={() => setExpandedModule(expandedModule === idx ? -1 : idx)}
                                                        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-neutral-50 transition-colors text-left">
                                                        <ChevronIcon open={expandedModule === idx} />
                                                        <span className="text-[13px] font-semibold text-neutral-900 flex-1">{mod.name}</span>
                                                        <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded font-medium">{mod.items.length}</span>
                                                    </button>

                                                    {expandedModule === idx && (
                                                        <div className="bg-neutral-50">
                                                            {mod.items.map((quiz, i) => (
                                                                <Link to={`/quiz/${quiz.quiz_id}`} key={quiz.quiz_id}
                                                                    className={`flex items-center gap-2.5 px-4 py-2.5 pl-10 hover:bg-neutral-100 transition-colors no-underline border-t border-neutral-100 group ${completedQuizIds.includes(quiz.quiz_id) ? 'bg-emerald-50/50' : ''}`}>
                                                                    {completedQuizIds.includes(quiz.quiz_id) ? (
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                                                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                                                            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                                                        </svg>
                                                                    )}
                                                                    <span className={`text-[12px] font-medium flex-1 truncate group-hover:text-neutral-900 ${completedQuizIds.includes(quiz.quiz_id) ? 'text-emerald-700' : 'text-neutral-600'}`}>{quiz.title}</span>
                                                                    {completedQuizIds.includes(quiz.quiz_id) ? (
                                                                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded flex-shrink-0">DONE</span>
                                                                    ) : (
                                                                        <span className="text-[10px] text-neutral-400 flex-shrink-0">{quiz.time_limit}m</span>
                                                                    )}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!showQuizzes && quizzes.length === 0 && (
                                        <p className="text-neutral-400 text-[12px] text-center py-4">No quizzes available</p>
                                    )}

                                    {/* Divider */}
                                    <div className="border-t border-neutral-200" />

                                    {/* ── Sessions Section ── */}
                                    <button onClick={() => { setShowSessions(!showSessions); setActiveBookedSession(null) }}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 text-[13px] font-semibold transition-colors ${showSessions ? 'bg-blue-600 text-white' : 'bg-white text-slate-900 hover:bg-slate-50'}`}>
                                        <span className="flex items-center gap-2.5">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94M2 15.28V21a1 1 0 001.15 1A19.94 19.94 0 0021 4.15 1 1 0 0020.72 3h-5.73a1 1 0 00-1 .8l-1.2 6a1 1 0 00.29.87l2.28 2.28a16 16 0 01-6.52 6.52L6.33 17.2a1 1 0 00-.87-.29l-6 1.2a1 1 0 00-.8 1z" />
                                            </svg>
                                            Live Sessions
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${showSessions ? 'bg-white/10 text-neutral-400' : 'bg-neutral-100 text-neutral-500'}`}>
                                            {availableSessions.length + myBookedSessions.length}
                                        </span>
                                    </button>

                                    {showSessions && (
                                        <div className="divide-y divide-neutral-100">
                                            {/* Booked */}
                                            {myBookedSessions.map(s => (
                                                <div key={s.session_id} className="px-4 py-3 hover:bg-neutral-50 transition-colors">
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[12px] font-semibold text-neutral-900 truncate">{s.title}</p>
                                                            <p className="text-[10px] text-neutral-400 mt-0.5">{s.session_date} · {s.start_time} · {s.duration_minutes}m</p>
                                                        </div>
                                                        <button onClick={() => setActiveBookedSession(s)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors flex-shrink-0 shadow-sm shadow-blue-600/20">
                                                            Join
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Available */}
                                            {availableSessions.map(s => (
                                                <div key={s.session_id} className="px-4 py-3 hover:bg-neutral-50 transition-colors">
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[12px] font-semibold text-neutral-900 truncate">{s.title}</p>
                                                            <p className="text-[10px] text-neutral-400 mt-0.5">{s.session_date} · {s.start_time} · {s.duration_minutes}m</p>
                                                        </div>
                                                        <button onClick={() => handleBook(s.session_id)}
                                                            className="bg-white hover:bg-blue-50 text-blue-700 text-[11px] font-semibold px-3 py-1.5 rounded-md border border-blue-200 transition-colors flex-shrink-0">
                                                            Book
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {sessions.length === 0 && (
                                                <p className="text-neutral-400 text-[12px] text-center py-4">No sessions scheduled</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Rate, Comment & Recommendations (below video player) ── */}
                {activeVideo && (
                    <div className="mb-12 space-y-8">

                        {/* Rate & Comment row */}
                        <div className="flex gap-6 flex-col lg:flex-row">

                            {/* Rate this course */}
                            <div className="border border-slate-200 rounded-xl p-5 flex-1 bg-white shadow-sm">
                                <h3 className="text-[14px] font-bold text-neutral-900 mb-3 flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                    Rate this course
                                </h3>
                                <div className="flex items-center gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={async () => {
                                                setUserRating(star)
                                                setRatingSubmitted(false)
                                                try {
                                                    await rateCourse({ user_id: user?.user_id, course_id: activeVideo.course_id, rating: star }).unwrap()
                                                    setRatingSubmitted(true)
                                                } catch (e) { console.error('Rating failed', e) }
                                            }}
                                            className="transition-transform hover:scale-110 cursor-pointer bg-transparent border-none p-0">
                                            <StarRatingIcon filled={star <= userRating} hovered={star <= hoverRating && star > userRating} />
                                        </button>
                                    ))}
                                </div>
                                {ratingSubmitted && (
                                    <p className="text-[12px] text-emerald-600 font-medium flex items-center gap-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        Rating saved! Thank you.
                                    </p>
                                )}
                                {!ratingSubmitted && userRating === 0 && (
                                    <p className="text-[11px] text-neutral-400">Click a star to rate</p>
                                )}
                            </div>

                            {/* Comments */}
                            <div className="rounded-2xl flex-[2] overflow-hidden bg-white border border-slate-200 shadow-sm">
                                {/* Toggle Header */}
                                <button onClick={() => setShowComments(prev => !prev)}
                                    className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-slate-50/80 transition-all duration-200 border-b border-transparent"
                                    style={showComments ? { borderBottomColor: '#e2e8f0' } : {}}>
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-600/20">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[14px] font-bold text-slate-900">Discussion</span>
                                        <span className="text-[12px] text-slate-400 ml-2">{courseComments.length} comment{courseComments.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        className={`transition-transform duration-300 ${showComments ? 'rotate-180' : ''}`}>
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>

                                {showComments && <div className="p-5 space-y-5" style={{ animation: 'fadeIn 0.2s ease' }}>

                                    {/* Comment Input */}
                                    <div className="flex gap-3 items-start">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 shadow-sm shadow-blue-600/20">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 relative">
                                            <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                                                onKeyDown={async e => {
                                                    if (e.key === 'Enter' && commentText.trim()) {
                                                        const text = commentText.trim()
                                                        setLocalComments(prev => [{ name: user?.name || 'You', text, user_id: user?.user_id, created_at: new Date().toISOString() }, ...prev])
                                                        setCommentText('')
                                                        try {
                                                            await addCourseComment({ user_id: user?.user_id, course_id: activeVideo.course_id, comment_text: text }).unwrap()
                                                            setLocalComments([])
                                                        } catch (err) { console.error('Comment API failed, showing locally', err) }
                                                    }
                                                }}
                                                placeholder="Write a comment..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 pr-20 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all" />
                                            <button onClick={async () => {
                                                if (commentText.trim()) {
                                                    const text = commentText.trim()
                                                    setLocalComments(prev => [{ name: user?.name || 'You', text, user_id: user?.user_id, created_at: new Date().toISOString() }, ...prev])
                                                    setCommentText('')
                                                    try {
                                                        await addCourseComment({ user_id: user?.user_id, course_id: activeVideo.course_id, comment_text: text }).unwrap()
                                                        setLocalComments([])
                                                    } catch (err) { console.error('Comment API failed, showing locally', err) }
                                                }
                                            }}
                                                disabled={!commentText.trim()}
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-sm shadow-blue-600/20">
                                                Post
                                            </button>
                                        </div>
                                    </div>

                                    {/* Comment List */}
                                    {courseComments.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-2">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-[13px] text-neutral-400 font-medium">No comments yet</p>
                                            <p className="text-[12px] text-neutral-300 mt-0.5">Be the first to share your thoughts!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d4 transparent' }}>
                                            {courseComments.map((c, i) => {
                                                const timeStr = c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'
                                                const isOwn = c.user_id === user?.user_id
                                                return (
                                                    <div key={c.comment_id || i} className="flex gap-3 group p-3 rounded-xl hover:bg-neutral-50 transition-colors -mx-1">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-neutral-700 text-[11px] font-bold flex-shrink-0">
                                                            {(c.name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-neutral-900 text-[13px]">{c.name || 'User'}</span>
                                                                <span className="text-neutral-300 text-[11px]">·</span>
                                                                <span className="text-neutral-400 text-[11px]">{timeStr}</span>
                                                            </div>
                                                            <p className="text-[13px] text-neutral-600 mt-1 leading-relaxed">{c.text}</p>
                                                        </div>
                                                        {isOwn && (
                                                            <button onClick={async () => {
                                                                try {
                                                                    await deleteCourseComment({ comment_id: c.comment_id, user_id: user?.user_id, course_id: activeVideo.course_id }).unwrap()
                                                                } catch (err) { console.error('Delete failed', err) }
                                                            }}
                                                                className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-500 transition-all flex-shrink-0 self-center"
                                                                title="Delete comment">
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>}</div>
                        </div>

                        {/* Recommended Courses */}
                        {recommendations?.similar_courses?.length > 0 && (
                            <div>
                                <h3 className="text-[16px] font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                    Recommended for you
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {recommendations.similar_courses.slice(0, 4).map(rec => (
                                        <CourseCardComponent key={rec.course_id} course={rec} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Course Grid ── */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-[20px] font-semibold text-slate-900">Your Courses</h2>
                        <span className="bg-blue-100 text-blue-700 text-[12px] font-semibold px-2.5 py-0.5 rounded-md">
                            {purchasedCourses.length}
                        </span>
                    </div>

                    {paymentsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                                    <div className="pt-[56.25%] bg-neutral-100 animate-pulse" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-3.5 bg-neutral-100 rounded w-3/4 animate-pulse" />
                                        <div className="h-3 bg-neutral-100 rounded w-1/2 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : purchasedCourses.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-white">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
                            </div>
                            <p className="text-slate-600 text-[15px] font-medium mb-1">No purchased courses yet</p>
                            <p className="text-slate-400 text-[13px] mb-5">Browse our catalog to find courses you love</p>
                            <Link to="/"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors no-underline shadow-sm shadow-blue-600/20">
                                Browse Courses
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {purchasedCourses.map(course => (
                                <CourseCard
                                    key={course.payment_id || course.course_id}
                                    course={course}
                                    isActive={activeVideo?.course_id === course.course_id}
                                    onPlay={() => { setActiveVideo(course); setShowQuizzes(false); setExpandedModule(-1); setShowSessions(false) }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ─── Course Card ────────────────────────────────────── */
const CourseCard = ({ course, isActive, onPlay }) => {
    const videoId = getVideoId(course.youtube_url)
    const thumbnail = videoId ? getThumbnail(course.youtube_url) : null

    return (
        <div onClick={onPlay}
            className={`bg-white rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 border ${isActive
                ? 'border-blue-600 shadow-[0_0_0_1px_#2563eb] shadow-blue-600/10'
                : 'border-slate-200 hover:border-blue-300 hover:shadow-[0_4px_20px_rgba(37,99,235,0.08)]'
                }`}>
            {/* Thumbnail */}
            <div className="relative pt-[56.25%] bg-neutral-100 overflow-hidden">
                {thumbnail ? (
                    <img src={thumbnail} alt={course.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                ) : (
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><polyline points="8 21 16 21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                    </div>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all duration-200">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 shadow-lg">
                        <PlayIcon size={16} />
                    </div>
                </div>
                {/* Active indicator */}
                {isActive && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Playing
                    </div>
                )}
            </div>
            {/* Info */}
            <div className="p-4">
                <h3 className="text-[14px] font-semibold text-slate-900 leading-snug line-clamp-2 mb-2">{course.title}</h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{course.instructor}</span>
                    <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                    <span>{course.category}</span>
                </div>
            </div>
        </div>
    )
}

export default PurchasedCourses