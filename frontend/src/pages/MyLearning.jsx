// My Learning Page — Clean B&W Tailwind Redesign
// Purchased courses + recommendations · Inter font · Notion/Medium-inspired
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetCoursesQuery } from '../store/api/courseApi'
import { useGetUserPaymentsQuery } from '../store/api/paymentApi'
import useAuth from '../hooks/useAuth'
import { getVideoId, getThumbnail } from '../utils/youtube'

const MyLearning = () => {
    const { user, isAuthenticated } = useAuth()
    const [activeTab, setActiveTab] = useState('all')

    const { data: purchasedData, isLoading: purchasedLoading } = useGetUserPaymentsQuery(
        user?.user_id, { skip: !user?.user_id }
    )
    const purchasedCourses = purchasedData || []

    const { data, isLoading } = useGetCoursesQuery({ page: 1, limit: 50 })
    const courses = data?.courses || []

    const purchasedIds = purchasedCourses.map(p => p.course_id)
    const getRecommended = () => courses.filter(c => !purchasedIds.includes(c.course_id)).sort(() => Math.random() - 0.5).slice(0, 8)

    const categories = [...new Set(purchasedCourses.map(p => p.category).filter(Boolean))]
    const filteredCourses = activeTab === 'all'
        ? purchasedCourses
        : purchasedCourses.filter(p => p.category === activeTab)

    // ── Not authenticated ───────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                <div className="text-center px-6">
                    <h2 className="text-[28px] font-bold text-neutral-900 mb-2 tracking-tight">My Learning</h2>
                    <p className="text-neutral-500 text-[15px]">Sign in to access your courses</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ── Hero ── */}
            <div className="border-b border-neutral-100 bg-neutral-50">
                <div className="max-w-[1400px] mx-auto px-4 pt-10 pb-8">
                    <h1 className="text-[32px] font-bold text-neutral-900 tracking-tight leading-none">
                        My Learning
                    </h1>
                    <p className="text-neutral-400 text-[15px] mt-2">
                        Welcome back, <span className="text-neutral-900 font-semibold">{user?.name?.split(' ')[0]}</span>. Continue where you left off.
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 mt-7">
                        <StatCard value={purchasedCourses.length} label="Courses" />
                        <StatCard value={categories.length} label="Categories" />
                        <StatCard value={purchasedCourses.length > 0 ? 'Active' : '—'} label="Status" />
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-[1400px] mx-auto px-4 py-10">

                {/* My Courses header + filter */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[20px] font-semibold text-neutral-900">My Courses</h2>
                        <span className="bg-neutral-100 text-neutral-500 text-[12px] font-semibold px-2.5 py-0.5 rounded-md">
                            {purchasedCourses.length}
                        </span>
                    </div>

                    {categories.length > 1 && (
                        <div className="flex gap-1.5 flex-wrap">
                            <TabBtn active={activeTab === 'all'} onClick={() => setActiveTab('all')}>All</TabBtn>
                            {categories.map(cat => (
                                <TabBtn key={cat} active={activeTab === cat} onClick={() => setActiveTab(cat)}>{cat}</TabBtn>
                            ))}
                        </div>
                    )}
                </div>

                {purchasedLoading ? (
                    <LoadingGrid />
                ) : purchasedCourses.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCourses.map(p => (
                            <PurchasedCard key={p.payment_id} purchase={p} />
                        ))}
                    </div>
                )}

                {/* ── Recommendations ── */}
                <div className="mt-14">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-[20px] font-semibold text-neutral-900">Recommended</h2>
                        <span className="bg-neutral-100 text-neutral-500 text-[11px] font-semibold px-2.5 py-0.5 rounded-md tracking-wide">
                            FOR YOU
                        </span>
                    </div>

                    {isLoading ? (
                        <LoadingGrid />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {getRecommended().map(c => (
                                <CourseCard key={c.course_id} course={c} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ─── Sub-Components ─────────────────────────────────── */

const StatCard = ({ value, label }) => (
    <div className="bg-white border border-neutral-200 rounded-xl px-5 py-3.5 min-w-[120px]">
        <div className="text-[22px] font-bold text-neutral-900 leading-none">{value}</div>
        <div className="text-[12px] text-neutral-400 font-medium mt-1">{label}</div>
    </div>
)

const TabBtn = ({ active, onClick, children }) => (
    <button onClick={onClick}
        className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${active
            ? 'bg-neutral-900 text-white'
            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700'
            }`}>
        {children}
    </button>
)

const PurchasedCard = ({ purchase }) => {
    const videoId = getVideoId(purchase.youtube_url)
    const thumbnail = videoId ? getThumbnail(purchase.youtube_url) : null

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden group hover:border-neutral-400 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-200">
            {/* Thumbnail */}
            <Link to={`/purchased-courses?play=${purchase.course_id}`} className="block relative">
                <div className="relative pt-[56.25%] bg-neutral-100 overflow-hidden">
                    {thumbnail ? (
                        <img src={thumbnail} alt={purchase.course_title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                    ) : (
                        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><polyline points="8 21 16 21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                        </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all duration-200">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 shadow-lg">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#111"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </div>
                    </div>
                    {/* Badge */}
                    <span className="absolute top-2.5 left-2.5 bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide">
                        OWNED
                    </span>
                </div>
            </Link>

            {/* Info */}
            <div className="p-4">
                <h3 className="text-[14px] font-semibold text-neutral-900 leading-snug mb-1 line-clamp-2">
                    {purchase.course_title}
                </h3>
                <p className="text-[12px] text-neutral-400 mb-3">{purchase.instructor}</p>
                <div className="flex items-center gap-1.5 mb-3">
                    {purchase.category && (
                        <span className="text-[11px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded font-medium">{purchase.category}</span>
                    )}
                    {purchase.course_level && (
                        <span className="text-[11px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded font-medium">{purchase.course_level}</span>
                    )}
                </div>

                {/* Continue Learning */}
                <Link to={`/purchased-courses?play=${purchase.course_id}`}
                    className="flex items-center justify-center gap-2 w-full bg-neutral-900 hover:bg-black text-white text-[13px] font-semibold py-2.5 rounded-lg transition-colors no-underline">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    Continue Learning
                </Link>
            </div>
        </div>
    )
}

const CourseCard = ({ course }) => {
    const videoId = getVideoId(course.youtube_url)
    const thumbnail = videoId ? getThumbnail(course.youtube_url) : null

    return (
        <Link to={`/course/${course.course_id}`} className="block no-underline text-inherit group">
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200">
                <div className="relative pt-[56.25%] bg-neutral-100 overflow-hidden">
                    {thumbnail ? (
                        <img src={thumbnail} alt={course.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                    ) : (
                        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><polyline points="8 21 16 21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                        </div>
                    )}
                </div>
                <div className="p-3.5">
                    <h3 className="text-[13px] font-semibold text-neutral-900 leading-snug mb-1 line-clamp-2 group-hover:text-neutral-600 transition-colors">
                        {course.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mb-2">{course.instructor}</p>
                    <div className="flex items-center gap-1.5">
                        {course.category && (
                            <span className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded font-medium">{course.category}</span>
                        )}
                        {course.level && (
                            <span className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded font-medium">{course.level}</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}

const EmptyState = () => (
    <div className="text-center py-16 border border-dashed border-neutral-200 rounded-xl">
        <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
        </div>
        <h3 className="text-[16px] font-semibold text-neutral-900 mb-1">No courses yet</h3>
        <p className="text-neutral-400 text-[14px] mb-5 max-w-[280px] mx-auto">Start your learning journey by exploring our catalog</p>
        <Link to="/"
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors no-underline">
            Browse Courses
        </Link>
    </div>
)

const LoadingGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-neutral-200 overflow-hidden">
                <div className="pt-[56.25%] bg-neutral-100 animate-pulse" />
                <div className="p-4 space-y-2">
                    <div className="h-3.5 bg-neutral-100 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-neutral-100 rounded w-1/2 animate-pulse" />
                </div>
            </div>
        ))}
    </div>
)

export default MyLearning
