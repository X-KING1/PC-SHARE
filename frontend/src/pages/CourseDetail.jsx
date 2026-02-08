import { useParams, Link } from "react-router-dom"
import { useState, useMemo, useEffect, useRef } from "react"
import { useGetCourseQuery, useGetRecommendationsQuery } from "../store/api/courseApi"
import { useGetQuizzesQuery } from "../store/api/quizApi"
import { getThumbnail } from "../utils/youtube"
import YouTubePlayer from "../components/YouTubePlayer"
import CourseCard from "../components/CourseCard"
import LoadingSpinner from "../components/LoadingSpinner"

const TRIAL_DURATION = 10 // seconds of free preview

const CourseDetail = () => {
    const { id } = useParams()
    const [trialMode, setTrialMode] = useState("locked") // "locked" | "playing" | "expired"
    const [trialTimeLeft, setTrialTimeLeft] = useState(TRIAL_DURATION)
    const [expandedSection, setExpandedSection] = useState(0)
    const timerRef = useRef(null)

    const { data: course, isLoading: courseLoading, isError: courseError } = useGetCourseQuery(id)
    const { data: quizzes = [] } = useGetQuizzesQuery(id)
    const { data: recommendations = {} } = useGetRecommendationsQuery(id)

    const thumbnail = useMemo(() => getThumbnail(course?.youtube_url, "MAXRES"), [course?.youtube_url])

    const roundedRating = useMemo(() => {
        const r = Number(course?.rating || 4.9)
        return Math.min(5, Math.max(0, Math.round(r)))
    }, [course?.rating])

    // Group quizzes into modules (3 per module)
    const modules = useMemo(() => {
        if (!quizzes.length) return []
        const moduleNames = ["Getting Started", "Core Concepts", "Advanced Topics", "Final Project"]
        const grouped = []
        for (let i = 0; i < quizzes.length; i += 3) {
            grouped.push({
                name: moduleNames[grouped.length] || `Module ${grouped.length + 1}`,
                items: quizzes.slice(i, i + 3)
            })
        }
        return grouped
    }, [quizzes])

    // Trial timer countdown
    useEffect(() => {
        if (trialMode === "playing" && trialTimeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTrialTimeLeft(prev => prev - 1)
            }, 1000)
        } else if (trialMode === "playing" && trialTimeLeft <= 0) {
            setTrialMode("expired")
        }
        return () => clearTimeout(timerRef.current)
    }, [trialMode, trialTimeLeft])

    const startTrial = () => {
        setTrialMode("playing")
        setTrialTimeLeft(TRIAL_DURATION)
    }

    if (courseLoading) return <LoadingSpinner message="Loading course..." />

    if (courseError || !course) {
        return (
            <div className="cdv2-error">
                <div className="cdv2-error-box">
                    <span>📚</span>
                    <h2>Course Not Found</h2>
                    <p>The course you're looking for doesn't exist.</p>
                    <Link to="/courses">Browse All Courses</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="cdv2">
            {/* ===== HERO SECTION ===== */}
            <header className="cdv2-hero">
                <div className="cdv2-hero-wrap">
                    {/* Left: Course Info */}
                    <div className="cdv2-hero-left">
                        <h1 className="cdv2-title">{course.title}</h1>

                        <div className="cdv2-meta">
                            <span className="cdv2-stars">{"★".repeat(roundedRating)}{"☆".repeat(5 - roundedRating)}</span>
                            <span className="cdv2-rating">{course.rating || "4.9"}</span>
                            <span className="cdv2-students">12,458 students</span>
                        </div>

                        <div className="cdv2-tags">
                            <span>{course.category}</span>
                            {course.subcategory && <span>{course.subcategory}</span>}
                            <span>{course.level || "All Levels"}</span>
                        </div>
                    </div>

                    {/* Right: Video with Trial Preview */}
                    <div className="cdv2-hero-right">
                        {trialMode === "playing" && course.youtube_url ? (
                            <div className="cdv2-trial-container">
                                <div className="cdv2-trial-player">
                                    <YouTubePlayer videoUrl={course.youtube_url} title={course.title} />
                                </div>
                                <div className="cdv2-trial-bar">
                                    <span className="cdv2-trial-timer">⏱ Trial: {trialTimeLeft}s left</span>
                                    <div className="cdv2-trial-progress">
                                        <div
                                            className="cdv2-trial-fill"
                                            style={{ width: `${(trialTimeLeft / TRIAL_DURATION) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : trialMode === "expired" ? (
                            <div className="cdv2-video-thumb cdv2-locked">
                                {thumbnail ? (
                                    <img src={thumbnail} alt={course.title} />
                                ) : (
                                    <div className="cdv2-thumb-empty">🎬</div>
                                )}
                                <div className="cdv2-lock-overlay">
                                    <span className="cdv2-lock-icon">⏰</span>
                                    <span className="cdv2-lock-text">Trial Ended</span>
                                    <span className="cdv2-lock-sub">Purchase to continue watching</span>
                                </div>
                            </div>
                        ) : (
                            <div className="cdv2-video-thumb" onClick={startTrial}>
                                {thumbnail ? (
                                    <img src={thumbnail} alt={course.title} />
                                ) : (
                                    <div className="cdv2-thumb-empty">🎬</div>
                                )}
                                <div className="cdv2-preview-overlay">
                                    <button className="cdv2-preview-btn">▶</button>
                                    <span className="cdv2-preview-text">Watch {TRIAL_DURATION}s Free Preview</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <main className="cdv2-main">
                <div className="cdv2-grid">
                    {/* LEFT COLUMN */}
                    <div className="cdv2-left">
                        {/* Mobile Video */}
                        <div className="cdv2-mobile-vid">
                            {course.youtube_url && <YouTubePlayer videoUrl={course.youtube_url} title={course.title} />}
                        </div>

                        {/* What You'll Learn */}
                        <section className="cdv2-card">
                            <h2>What you'll learn</h2>
                            <ul className="cdv2-learn-list">
                                <li><span className="cdv2-check">✓</span> Build dynamic web applications</li>
                                <li><span className="cdv2-check">✓</span> Create your center with React</li>
                                <li><span className="cdv2-check">✓</span> Develop frontend with React</li>
                                <li><span className="cdv2-check">✓</span> Deploy to the cloud</li>
                                <li><span className="cdv2-check">✓</span> Create backend APIs with Node.js</li>
                                <li><span className="cdv2-check">✓</span> Understand database design</li>
                            </ul>
                        </section>

                        {/* Course Content */}
                        <section className="cdv2-card">
                            <h2>Course Content</h2>
                            <div className="cdv2-modules">
                                {modules.length > 0 ? modules.map((mod, idx) => (
                                    <div key={idx} className="cdv2-module">
                                        <button
                                            className={`cdv2-module-btn ${expandedSection === idx ? 'open' : ''}`}
                                            onClick={() => setExpandedSection(expandedSection === idx ? -1 : idx)}
                                        >
                                            <span className="cdv2-arrow">{expandedSection === idx ? '▼' : '▶'}</span>
                                            <span className="cdv2-mod-name">Module {idx + 1}: {mod.name}</span>
                                            <span className="cdv2-mod-badge">{mod.items.length} lessons + quiz</span>
                                            <span className="cdv2-mod-time">1h 20m</span>
                                        </button>

                                        {expandedSection === idx && (
                                            <div className="cdv2-module-items">
                                                {mod.items.map((quiz, i) => (
                                                    <div key={quiz.quiz_id} className="cdv2-lesson cdv2-lesson-locked">
                                                        <span className="cdv2-lesson-num">{i + 1}.</span>
                                                        <span className="cdv2-lesson-name">{quiz.title}</span>
                                                        <span className="cdv2-lesson-lock">🔒</span>
                                                        <span className="cdv2-lesson-time">{quiz.time_limit} min</span>
                                                    </div>
                                                ))}
                                                <div className="cdv2-unlock-msg">
                                                    🔒 Purchase course to unlock all quizzes
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <p className="cdv2-empty">No content available yet.</p>
                                )}
                            </div>
                        </section>

                        {/* Requirements */}
                        <section className="cdv2-card">
                            <h2>Requirements</h2>
                            <ul className="cdv2-req-list">
                                <li>📌 Basic understanding of HTML, CSS</li>
                                <li>💻 A computer with internet access</li>
                                <li>🎯 No prior programming experience required</li>
                            </ul>
                        </section>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <aside className="cdv2-sidebar">
                        <div className="cdv2-sidebar-box">
                            {/* Price */}
                            <div className="cdv2-price-row">
                                <span className="cdv2-price">$19.99</span>
                                <span className="cdv2-price-old">$89.99</span>
                            </div>

                            {/* Buy Now Button - Removed for now */}
                            <button className="cdv2-btn-wish">♡ Add to Wishlist</button>

                            {/* Includes */}
                            <div className="cdv2-includes">
                                <h4>This course includes:</h4>
                                <ul>
                                    <li>📹 24 hours on-demand video</li>
                                    <li>📄 15 downloadable resources</li>
                                    <li>📝 {quizzes.length} comprehensive quizzes</li>
                                    <li>🏆 Certificate of completion</li>
                                    <li>♾️ Full lifetime access</li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* INSTRUCTOR SECTION */}
                <section className="cdv2-instructor">
                    <div className="cdv2-instructor-box">
                        <div className="cdv2-instructor-avatar">
                            {course.instructor?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div className="cdv2-instructor-info">
                            <h3>{course.instructor || "Alex Johnson"}</h3>
                            <p className="cdv2-instructor-role">Senior {course.category} Developer & Instructor</p>
                            <div className="cdv2-instructor-stats">
                                <span>⭐ 4.8 Instructor Rating</span>
                                <span>👥 50k Students</span>
                                <span>📚 12 Courses</span>
                            </div>
                            <p className="cdv2-instructor-bio">
                                {course.instructor || "Alex"} is a seasoned developer with over 10 years of experience in the industry.
                                He is passionate about teaching and has helped thousands of students start their careers in tech.
                            </p>
                        </div>
                    </div>
                </section>

                {/* RECOMMENDATIONS */}
                {recommendations?.similar_courses?.length > 0 && (
                    <section className="cdv2-recs">
                        <h2>Students also bought</h2>
                        <div className="cdv2-recs-grid">
                            {recommendations.similar_courses.slice(0, 4).map((rec) => (
                                <CourseCard key={rec.course_id} course={rec} />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}

export default CourseDetail
