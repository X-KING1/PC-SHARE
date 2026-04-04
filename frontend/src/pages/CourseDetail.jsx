// CourseDetail — Premium B&W Redesign (Udemy/Masterclass inspired)
import { useParams, Link, useNavigate } from "react-router-dom"
import { useState, useMemo, useEffect, useRef } from "react"
import { useGetCourseQuery, useGetRecommendationsQuery, useGetCourseCommentsQuery, useAddCourseCommentMutation, useDeleteCourseCommentMutation } from "../store/api/courseApi"
import { useGetQuizzesQuery } from "../store/api/quizApi"
import { useGetStripeConfigQuery, useCreateStripeIntentMutation, useInitiateKhaltiPaymentMutation, useCheckPurchaseQuery } from "../store/api/paymentApi"
import { useAuth } from "../hooks/useAuth"
import { getThumbnail } from "../utils/youtube"
import YouTubePlayer from "../components/YouTubePlayer"
import CourseCard from "../components/CourseCard"
import LoadingSpinner from "../components/LoadingSpinner"

const TRIAL_DURATION = 10
const COURSE_PRICE_USD = 1999
const COURSE_PRICE_NPR = 2500

/* ─── Static Data ────────────────────────── */
const REVIEWS = [
    { name: "Sarah K.", initial: "S", rating: 5, text: "Incredible course! The instructor explains complex concepts in a simple way. Highly recommended for beginners and intermediates alike." },
    { name: "James L.", initial: "J", rating: 5, text: "Best investment I've made in my career. The projects are practical and the support is outstanding. Worth every penny." },
    { name: "Priya M.", initial: "P", rating: 4, text: "Very well structured. I loved the hands-on approach. Only wish there was more advanced content, but overall excellent." }
]

/* ─── SVG Icons ──────────────────────────── */
const Icons = {
    chevron: ({ open }) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-90' : ''}`}>
            <polyline points="9 18 15 12 9 6" />
        </svg>
    ),
    check: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-900 flex-shrink-0 mt-0.5">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    lock: () => (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300 flex-shrink-0">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
    ),
    play: ({ size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
    ),
    heart: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
    ),
    clock: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    shield: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    share: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    ),
    video: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-neutral-400">
            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
        </svg>
    ),
    quiz: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-neutral-400">
            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    file: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-neutral-400">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
    ),
    medal: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-neutral-400">
            <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
    ),
    infinity: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-neutral-400">
            <path d="M18.18 8a7.12 7.12 0 00-10.18 0L12 12l-4 4a5.06 5.06 0 007.18 0A5.06 5.06 0 0018.18 8z" /><path d="M5.82 8a7.12 7.12 0 0110.18 0L12 12l4 4a5.06 5.06 0 01-7.18 0A5.06 5.06 0 015.82 8z" />
        </svg>
    ),
    checkSquare: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-neutral-400">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
    ),
    star: ({ filled, color = "#171717" }) => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    arrowRight: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    close: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    card: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
    ),
}

/* ─── Star Rating Row ────────────────────── */
const StarRow = ({ rating, size = 14, color = "#fbbf24" }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <Icons.star key={i} filled={i <= rating} color={color} />
        ))}
    </div>
)

/* ─── Component ──────────────────────────── */
const CourseDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const [trialMode, setTrialMode] = useState("locked")
    const [trialTimeLeft, setTrialTimeLeft] = useState(TRIAL_DURATION)
    const [expandedSection, setExpandedSection] = useState(0)
    const [allExpanded, setAllExpanded] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [paymentError, setPaymentError] = useState(null)
    const [showComments, setShowComments] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [localComments, setLocalComments] = useState([])
    const timerRef = useRef(null)

    const { data: course, isLoading: courseLoading, isError: courseError } = useGetCourseQuery(id)
    const { data: quizzes = [] } = useGetQuizzesQuery(id)
    const { data: recommendations = {} } = useGetRecommendationsQuery(id)
    const { data: apiComments = [], isError: commentsError } = useGetCourseCommentsQuery(id)
    const [addCourseComment] = useAddCourseCommentMutation()
    const [deleteCourseComment] = useDeleteCourseCommentMutation()
    const courseComments = commentsError ? localComments : [...apiComments, ...localComments.filter(lc => !apiComments.some(ac => ac.text === lc.text && ac.user_id === lc.user_id))]

    const { data: stripeConfig } = useGetStripeConfigQuery()
    const { data: purchaseCheck } = useCheckPurchaseQuery(
        { userId: user?.user_id, courseId: id },
        { skip: !user?.user_id }
    )
    const [createStripeIntent] = useCreateStripeIntentMutation()
    const [initiateKhalti] = useInitiateKhaltiPaymentMutation()
    const hasPurchased = purchaseCheck?.purchased || false

    const handleStripePayment = async () => {
        setPaymentLoading(true); setPaymentError(null)
        try {
            const result = await createStripeIntent({ amount: COURSE_PRICE_USD, currency: 'usd', course_id: parseInt(id), course_title: course?.title }).unwrap()
            if (result.checkoutUrl) window.location.href = result.checkoutUrl
            else setPaymentError('Could not create checkout session.')
        } catch (err) { setPaymentError(err?.data?.message || 'Payment failed. Please try again.') }
        finally { setPaymentLoading(false) }
    }

    const handleKhaltiPayment = async () => {
        setPaymentLoading(true); setPaymentError(null)
        try {
            const result = await initiateKhalti({ amount: COURSE_PRICE_NPR, course_id: parseInt(id) }).unwrap()
            if (result.payment_url) window.location.href = result.payment_url
        } catch (err) { setPaymentError(err?.data?.message || 'Khalti payment failed.') }
        finally { setPaymentLoading(false) }
    }

    const thumbnail = useMemo(() => getThumbnail(course?.youtube_url, "MAXRES"), [course?.youtube_url])
    const roundedRating = useMemo(() => Math.min(5, Math.max(0, Math.round(Number(course?.rating || 4.9)))), [course?.rating])

    const modules = useMemo(() => {
        if (!quizzes.length) return []
        const names = ["Getting Started", "Core Concepts", "Advanced Topics", "Final Project"]
        const grouped = []
        for (let i = 0; i < quizzes.length; i += 3) {
            grouped.push({ name: names[grouped.length] || `Module ${grouped.length + 1}`, items: quizzes.slice(i, i + 3) })
        }
        return grouped
    }, [quizzes])

    useEffect(() => {
        if (trialMode === "playing" && trialTimeLeft > 0) {
            timerRef.current = setTimeout(() => setTrialTimeLeft(prev => prev - 1), 1000)
        } else if (trialMode === "playing" && trialTimeLeft <= 0) {
            setTrialMode("expired")
        }
        return () => clearTimeout(timerRef.current)
    }, [trialMode, trialTimeLeft])

    const startTrial = () => { setTrialMode("playing"); setTrialTimeLeft(TRIAL_DURATION) }

    const toggleExpandAll = () => {
        setAllExpanded(!allExpanded)
        setExpandedSection(allExpanded ? -1 : 0)
    }

    /* ─── Loading / Error ──────────────────── */
    if (courseLoading) return <LoadingSpinner message="Loading course..." />

    if (courseError || !course) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                <div className="text-center px-6">
                    <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
                    <h2 className="text-[22px] font-bold text-neutral-900 mb-1.5">Course Not Found</h2>
                    <p className="text-neutral-400 text-[14px] mb-5">The course you're looking for doesn't exist.</p>
                    <Link to="/" className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors no-underline">
                        Browse Courses
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ════════════════════════════════════════════════
                SECTION 1 — HERO (Dark)
               ════════════════════════════════════════════════ */}
            <div className="bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900">
                <div className="max-w-[1400px] mx-auto px-4 py-10 lg:py-14">
                    <div className="flex gap-10 items-start flex-col lg:flex-row-reverse">
                        {/* Left: Course Info */}
                        <div className="flex-1 min-w-0 lg:pt-1">
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 mb-5 text-[12px]">
                                <Link to="/" className="text-neutral-500 hover:text-neutral-300 transition-colors no-underline font-medium">Courses</Link>
                                <span className="text-neutral-700">/</span>
                                <span className="text-neutral-500 font-medium">{course.category}</span>
                                {course.subcategory && <>
                                    <span className="text-neutral-700">/</span>
                                    <span className="text-neutral-400">{course.subcategory}</span>
                                </>}
                            </nav>

                            <h1 className="text-[28px] lg:text-[36px] font-bold text-white tracking-tight leading-tight mb-3">
                                {course.title}
                            </h1>

                            {/* Subtitle */}
                            <p className="text-neutral-400 text-[15px] leading-relaxed mb-5 max-w-2xl">
                                Master {course.category} with hands-on projects, real-world examples, and expert instruction. From beginner to professional.
                            </p>

                            {/* Rating row */}
                            <div className="flex items-center gap-3 mb-5 flex-wrap">
                                <span className="text-[14px] font-bold text-amber-400">{course.rating || "4.9"}</span>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Icons.star key={i} filled={i <= roundedRating} color="#fbbf24" />
                                    ))}
                                </div>
                                <span className="text-[13px] text-neutral-500">(2,847 ratings)</span>
                                <span className="text-neutral-700">·</span>
                                <span className="text-[13px] text-neutral-400">12,458 students</span>
                            </div>

                            {/* Instructor + Meta */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                                    {course.instructor?.charAt(0).toUpperCase() || "A"}
                                </div>
                                <span className="text-[13px] text-neutral-400">
                                    Created by <span className="text-white font-medium underline decoration-neutral-600 underline-offset-2">{course.instructor || "Instructor"}</span>
                                </span>
                            </div>

                            {/* Tags */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-semibold text-neutral-400 border border-neutral-700 px-2.5 py-1 rounded-md">{course.category}</span>
                                {course.subcategory && <span className="text-[11px] font-semibold text-neutral-400 border border-neutral-700 px-2.5 py-1 rounded-md">{course.subcategory}</span>}
                                <span className="text-[11px] font-semibold text-neutral-400 border border-neutral-700 px-2.5 py-1 rounded-md">{course.level || "All Levels"}</span>
                                <span className="text-[11px] text-neutral-500 flex items-center gap-1"><Icons.clock /> Last updated Feb 2026</span>
                            </div>
                        </div>

                        {/* Right: Video Preview */}
                        <div className="w-full lg:w-[520px] flex-shrink-0">
                            {trialMode === "playing" && course.youtube_url ? (
                                <div>
                                    <div className="rounded-xl overflow-hidden border border-neutral-700 shadow-2xl">
                                        <YouTubePlayer videoUrl={course.youtube_url} title={course.title} />
                                    </div>
                                    <div className="flex items-center justify-between mt-3 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5">
                                        <span className="text-[12px] text-white font-semibold flex items-center gap-1.5">
                                            <Icons.clock /> Trial: {trialTimeLeft}s left
                                        </span>
                                        <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-white rounded-full transition-all duration-1000"
                                                style={{ width: `${(trialTimeLeft / TRIAL_DURATION) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ) : trialMode === "expired" ? (
                                <div className="relative rounded-xl overflow-hidden border border-neutral-700 aspect-video bg-neutral-900 shadow-2xl">
                                    {thumbnail && <img src={thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-20" />}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                                        <Icons.clock />
                                        <p className="text-white text-[15px] font-semibold mt-3 mb-1">Trial Ended</p>
                                        <p className="text-neutral-500 text-[12px]">Purchase to continue watching</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden border border-neutral-700 aspect-video bg-neutral-900 cursor-pointer group shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.06)] transition-shadow" onClick={startTrial}>
                                    {thumbnail ? (
                                        <img src={thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                                            <Icons.video />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 flex flex-col items-center justify-center transition-colors">
                                        <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                                            <Icons.play size={22} />
                                        </div>
                                        <span className="text-white text-[13px] font-semibold">Watch {TRIAL_DURATION}s Free Preview</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════
                SECTION 2-7 — MAIN CONTENT
               ════════════════════════════════════════════════ */}
            <div className="max-w-[1400px] mx-auto px-4 py-10">
                <div className="flex gap-8 items-start flex-col lg:flex-row">

                    {/* ── LEFT COLUMN ── */}
                    <div className="flex-1 min-w-0 space-y-8">

                        {/* What you'll learn — Premium Card */}
                        <section className="bg-white rounded-2xl border border-neutral-200 overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div className="bg-neutral-900 px-6 py-4">
                                <h2 className="text-[17px] font-bold text-white flex items-center gap-2">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    What you'll learn
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {["Build dynamic web applications from scratch", "Create modern UIs with React components", "Develop frontend with React and hooks", "Deploy applications to the cloud", "Create backend APIs with Node.js & Express", "Understand database design patterns"].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-neutral-50 rounded-xl px-4 py-3">
                                            <div className="w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <span className="text-[14px] text-neutral-700 leading-snug font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Course Content — Premium Accordion */}
                        <section className="bg-white rounded-2xl border border-neutral-200 overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div className="px-6 py-5 border-b border-neutral-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-[17px] font-bold text-neutral-900 flex items-center gap-2">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                                            Course Content
                                        </h2>
                                        <p className="text-[12px] text-neutral-400 mt-1">{modules.length} sections · {quizzes.length} quizzes · 12h 30m total</p>
                                    </div>
                                    <button onClick={toggleExpandAll}
                                        className="text-[12px] font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-lg transition-all">
                                        {allExpanded ? 'Collapse all' : 'Expand all'}
                                    </button>
                                </div>
                            </div>

                            {modules.length > 0 ? (
                                <div className="divide-y divide-neutral-100">
                                    {modules.map((mod, idx) => {
                                        const isOpen = allExpanded || expandedSection === idx
                                        return (
                                            <div key={idx}>
                                                <button onClick={() => { if (!allExpanded) setExpandedSection(isOpen ? -1 : idx) }}
                                                    className="w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-50/80 transition-colors text-left">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                                                        <Icons.chevron open={isOpen} />
                                                    </div>
                                                    <span className="text-[14px] font-semibold text-neutral-900 flex-1">Module {idx + 1}: {mod.name}</span>
                                                    <span className="text-[11px] text-neutral-400 font-medium bg-neutral-100 px-2.5 py-1 rounded-md">{mod.items.length} lessons</span>
                                                </button>

                                                {isOpen && (
                                                    <div className="bg-neutral-50/50 divide-y divide-neutral-100/80">
                                                        {mod.items.map((quiz, i) => (
                                                            <div key={quiz.quiz_id} className="flex items-center gap-3 px-6 py-3 pl-16 hover:bg-white/80 transition-colors">
                                                                <div className="w-5 h-5 rounded bg-neutral-200 flex items-center justify-center flex-shrink-0">
                                                                    <Icons.quiz />
                                                                </div>
                                                                <span className="text-[13px] text-neutral-700 flex-1">{quiz.title}</span>
                                                                <Icons.lock />
                                                                <span className="text-[11px] text-neutral-400 flex items-center gap-1"><Icons.clock /> {quiz.time_limit}m</span>
                                                            </div>
                                                        ))}
                                                        <div className="px-6 py-3 pl-16 bg-neutral-100/70">
                                                            <span className="text-[12px] text-neutral-600 flex items-center gap-1.5 font-semibold">
                                                                <Icons.lock /> Enroll to unlock all content
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="py-14 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                                    </div>
                                    <p className="text-neutral-500 text-[14px] font-medium">No content available yet</p>
                                    <p className="text-neutral-400 text-[12px] mt-1">Content is being prepared</p>
                                </div>
                            )}
                        </section>

                        {/* Requirements — Clean Card */}
                        <section className="bg-white rounded-2xl border border-neutral-200 p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <h2 className="text-[17px] font-bold text-neutral-900 mb-5 flex items-center gap-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                Requirements
                            </h2>
                            <ul className="space-y-3">
                                {[
                                    "Basic understanding of HTML and CSS",
                                    "A computer with internet access",
                                    "No prior programming experience required"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[14px] text-neutral-600 bg-neutral-50 rounded-xl px-4 py-3">
                                        <span className="w-2 h-2 bg-neutral-900 rounded-full flex-shrink-0" />
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Instructor — Premium Card */}
                        <section className="bg-white rounded-2xl border border-neutral-200 overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center text-white text-[24px] font-bold flex-shrink-0 shadow-lg shadow-neutral-900/20">
                                        {course.instructor?.charAt(0).toUpperCase() || "A"}
                                    </div>
                                    <div>
                                        <h3 className="text-[18px] font-bold text-white">{course.instructor || "Alex Johnson"}</h3>
                                        <p className="text-[13px] text-neutral-400">Senior {course.category} Developer & Instructor</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4 flex-wrap">
                                    <span className="text-[12px] font-semibold text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                        <Icons.star filled color="#171717" /> 4.8 Rating
                                    </span>
                                    <span className="text-[12px] font-semibold text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg">50k Students</span>
                                    <span className="text-[12px] font-semibold text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg">12 Courses</span>
                                </div>
                                <p className="text-[14px] text-neutral-500 leading-relaxed">
                                    {course.instructor || "Alex"} is a seasoned developer with over 10 years of experience.
                                    Passionate about teaching, helping thousands of students start their careers in tech through hands-on, practical courses.
                                </p>
                            </div>
                        </section>

                        {/* Student Reviews — Enhanced */}
                        <section className="bg-white rounded-2xl border border-neutral-200 overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div className="px-6 py-5 border-b border-neutral-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[17px] font-bold text-neutral-900 flex items-center gap-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                        Student Reviews
                                    </h2>
                                    <div className="flex items-center gap-3 bg-neutral-100 px-4 py-2 rounded-xl">
                                        <span className="text-[24px] font-black text-neutral-900">{course.rating || "4.9"}</span>
                                        <div>
                                            <StarRow rating={roundedRating} color="#fbbf24" />
                                            <p className="text-[10px] text-neutral-500 mt-0.5 font-medium">Course rating</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Rating bars */}
                                <div className="space-y-2">
                                    {[
                                        { stars: 5, pct: 78 },
                                        { stars: 4, pct: 15 },
                                        { stars: 3, pct: 5 },
                                        { stars: 2, pct: 1 },
                                        { stars: 1, pct: 1 },
                                    ].map(row => (
                                        <div key={row.stars} className="flex items-center gap-3">
                                            <span className="text-[12px] text-neutral-500 font-semibold w-3 text-right">{row.stars}</span>
                                            <Icons.star filled color="#fbbf24" />
                                            <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-neutral-900 rounded-full transition-all" style={{ width: `${row.pct}%` }} />
                                            </div>
                                            <span className="text-[12px] text-neutral-400 font-semibold w-10 text-right">{row.pct}%</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Review cards */}
                                <div className="space-y-3">
                                    {REVIEWS.map((review, i) => (
                                        <div key={i} className="bg-neutral-50 rounded-xl p-5 hover:bg-neutral-100/80 transition-colors">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0">
                                                    {review.initial}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[14px] font-bold text-neutral-900">{review.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <StarRow rating={review.rating} color="#fbbf24" />
                                                        <span className="text-[11px] text-neutral-400">2 weeks ago</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[14px] text-neutral-600 leading-relaxed">{review.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ── RIGHT SIDEBAR (Sticky) ── */}
                    <div className="w-full lg:w-[340px] flex-shrink-0">
                        <div className="border border-neutral-200 rounded-2xl overflow-hidden sticky top-6" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                            {/* Price */}
                            <div className="p-5 pb-0">
                                <div className="flex items-baseline gap-2.5 mb-1">
                                    <span className="text-[32px] font-black text-neutral-900 tracking-tight">$19.99</span>
                                    <span className="text-[14px] text-neutral-400 line-through">$89.99</span>
                                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">78% off</span>
                                </div>
                            </div>

                            {/* Urgency bar */}
                            <div className="mx-5 mt-2 mb-4 bg-amber-50 border border-amber-200/50 rounded-lg px-3 py-2">
                                <p className="text-[12px] text-amber-800 font-semibold flex items-center gap-1.5">
                                    🔥 <span>2 days left at this price!</span>
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="px-5 space-y-2 mb-4">
                                {hasPurchased ? (
                                    <button onClick={() => navigate('/purchased-courses')}
                                        className="w-full bg-neutral-900 hover:bg-black text-white text-[15px] font-bold h-12 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-neutral-900/15">
                                        <Icons.check /> Continue Learning
                                        <Icons.arrowRight />
                                    </button>
                                ) : (
                                    <button onClick={() => {
                                        if (!isAuthenticated) { alert('Please login first to purchase this course.'); return }
                                        setShowPaymentModal(true)
                                    }}
                                        className="w-full bg-neutral-900 hover:bg-black text-white text-[15px] font-bold h-12 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-neutral-900/15">
                                        Buy Now
                                        <span className="group-hover:translate-x-0.5 transition-transform"><Icons.arrowRight /></span>
                                    </button>
                                )}
                                <button className="w-full bg-white hover:bg-neutral-50 text-neutral-900 text-[13px] font-semibold h-11 rounded-xl border border-neutral-200 hover:border-neutral-400 transition-colors flex items-center justify-center gap-2">
                                    <Icons.heart /> Add to Wishlist
                                </button>
                            </div>

                            {/* Guarantee */}
                            <div className="mx-5 mb-4 text-center">
                                <p className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
                                    <Icons.shield /> 30-Day Money-Back Guarantee
                                </p>
                            </div>

                            <div className="border-t border-neutral-100" />

                            {/* Includes */}
                            <div className="p-5">
                                <h4 className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider mb-3.5">This course includes</h4>
                                <ul className="space-y-3">
                                    {[
                                        { icon: <Icons.video />, text: "24 hours on-demand video" },
                                        { icon: <Icons.file />, text: "15 downloadable resources" },
                                        { icon: <Icons.checkSquare />, text: `${quizzes.length} comprehensive quizzes` },
                                        { icon: <Icons.medal />, text: "Certificate of completion" },
                                        { icon: <Icons.infinity />, text: "Full lifetime access" }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-[13px] text-neutral-600">
                                            {item.icon} {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-neutral-100" />

                            {/* Share */}
                            <div className="p-4 text-center">
                                <button className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 transition-colors flex items-center justify-center gap-1.5 mx-auto">
                                    <Icons.share /> Share this course
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7. Recommendations */}
                {recommendations?.similar_courses?.length > 0 && (
                    <section className="mt-14 border-t border-neutral-100 pt-10">
                        <h2 className="text-[18px] font-bold text-neutral-900 mb-6">Students also bought</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recommendations.similar_courses.slice(0, 4).map((rec) => (
                                <CourseCard key={rec.course_id} course={rec} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 8. Comments / Discussion */}
                <section className="mt-14 border-t border-neutral-100 pt-10">
                    <button onClick={() => setShowComments(prev => !prev)}
                        className="flex items-center gap-3 mb-6 group cursor-pointer bg-transparent border-none p-0">
                        <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center shadow-sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h2 className="text-[18px] font-bold text-neutral-900">Discussion</h2>
                            <p className="text-[12px] text-neutral-400">{courseComments.length} comment{courseComments.length !== 1 ? 's' : ''}</p>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={`ml-2 transition-transform duration-300 ${showComments ? 'rotate-180' : ''}`}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {showComments && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">

                            {/* Comment Input */}
                            {isAuthenticated ? (
                                <div className="flex gap-3 items-start">
                                    <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 shadow-sm">
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
                                                        await addCourseComment({ user_id: user?.user_id, course_id: Number(id), comment_text: text }).unwrap()
                                                        setLocalComments([])
                                                    } catch (err) { console.error('Comment failed', err) }
                                                }
                                            }}
                                            placeholder="Write a comment..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 pr-20 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all" />
                                        <button onClick={async () => {
                                            if (commentText.trim()) {
                                                const text = commentText.trim()
                                                setLocalComments(prev => [{ name: user?.name || 'You', text, user_id: user?.user_id, created_at: new Date().toISOString() }, ...prev])
                                                setCommentText('')
                                                try {
                                                    await addCourseComment({ user_id: user?.user_id, course_id: Number(id), comment_text: text }).unwrap()
                                                    setLocalComments([])
                                                } catch (err) { console.error('Comment failed', err) }
                                            }
                                        }}
                                            disabled={!commentText.trim()}
                                            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-neutral-900 hover:bg-black text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-sm">
                                            Post
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[13px] text-slate-400 text-center py-2">Sign in to leave a comment</p>
                            )}

                            {/* Comment List */}
                            {courseComments.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-[13px] text-slate-400 font-medium">No comments yet</p>
                                    <p className="text-[12px] text-slate-300 mt-0.5">Be the first to share your thoughts!</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d4 transparent' }}>
                                    {courseComments.map((c, i) => {
                                        const timeStr = c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'
                                        const isOwn = c.user_id === user?.user_id
                                        return (
                                            <div key={c.comment_id || i} className="flex gap-3 group p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 text-[11px] font-bold flex-shrink-0">
                                                    {(c.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 text-[13px]">{c.name || 'User'}</span>
                                                        <span className="text-slate-300 text-[11px]">·</span>
                                                        <span className="text-slate-400 text-[11px]">{timeStr}</span>
                                                    </div>
                                                    <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">{c.text}</p>
                                                </div>
                                                {isOwn && (
                                                    <button onClick={async () => {
                                                        try {
                                                            await deleteCourseComment({ comment_id: c.comment_id, user_id: user?.user_id, course_id: Number(id) }).unwrap()
                                                        } catch (err) { console.error('Delete failed', err) }
                                                    }}
                                                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all flex-shrink-0 self-center"
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
                        </div>
                    )}
                </section>
            </div>

            {/* ════════════════════════════════════════════════
                SECTION 8 — PAYMENT MODAL (White)
               ════════════════════════════════════════════════ */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => { setShowPaymentModal(false); setPaymentError(null) }}>
                    <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 relative"
                        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>

                        <button className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
                            onClick={() => { setShowPaymentModal(false); setPaymentError(null) }}>
                            <Icons.close />
                        </button>

                        <h2 className="text-[18px] font-bold text-neutral-900 mb-0.5">Choose Payment Method</h2>
                        <p className="text-neutral-400 text-[13px] mb-5 truncate">{course.title}</p>

                        {paymentError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-lg p-3 mb-4">{paymentError}</div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button onClick={handleStripePayment} disabled={paymentLoading}
                                className="flex items-center gap-4 w-full p-4 bg-white hover:bg-neutral-50 border-2 border-neutral-200 hover:border-[#635bff] rounded-xl transition-all disabled:opacity-50 group">
                                <span className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-white border border-neutral-200">
                                    <img src="/stripe-logo.svg" alt="Stripe" className="w-9 h-6 object-contain" />
                                </span>
                                <div className="text-left flex-1">
                                    <span className="block text-neutral-900 font-bold text-[14px]">Stripe</span>
                                    <span className="block text-neutral-400 text-[11px]">Credit/Debit Card (International)</span>
                                </div>
                                <span className="text-neutral-900 font-black text-[15px]">$19.99</span>
                            </button>

                            <button onClick={handleKhaltiPayment} disabled={paymentLoading}
                                className="flex items-center gap-4 w-full p-4 bg-white hover:bg-neutral-50 border-2 border-neutral-200 hover:border-[#5C2D91] rounded-xl transition-all disabled:opacity-50 group">
                                <span className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    <img src="/khalti-logo.svg" alt="Khalti" className="w-11 h-11 object-contain" />
                                </span>
                                <div className="text-left flex-1">
                                    <span className="block text-neutral-900 font-bold text-[14px]">Khalti</span>
                                    <span className="block text-neutral-400 text-[11px]">Nepal Digital Wallet</span>
                                </div>
                                <span className="text-neutral-900 font-black text-[15px]">NPR 2,500</span>
                            </button>
                        </div>

                        {paymentLoading && (
                            <div className="flex items-center justify-center gap-2 mt-4 text-neutral-500 text-[13px]">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Processing payment...
                            </div>
                        )}

                        <p className="text-center text-[11px] text-neutral-400 mt-4 flex items-center justify-center gap-1">
                            <Icons.shield /> Secure payment · Instant access
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CourseDetail
