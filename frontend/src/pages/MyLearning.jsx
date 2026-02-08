// TuneCasa My Learning Page Pattern - RTK Query
// Shows personalized videos and collaborative recommendations for logged-in users
import { Link } from 'react-router-dom'
import { useGetCoursesQuery } from '../store/api/courseApi'
import useAuth from '../hooks/useAuth'
import { getVideoId, getThumbnail } from '../utils/youtube'

const MyLearning = () => {
    const { user, isAuthenticated } = useAuth()

    // Fetch courses for recommendations
    const { data, isLoading } = useGetCoursesQuery({ page: 1, limit: 50 })
    const courses = data?.courses || []

    // Simulate collaborative filtering - shuffle courses for "personalized" feel
    // In production, this would come from the ML service
    const getCollabCourses = () => {
        return [...courses].sort(() => Math.random() - 0.5).slice(0, 8)
    }

    const getPopularCourses = () => {
        return [...courses].sort(() => Math.random() - 0.5).slice(0, 8)
    }

    const getNewCourses = () => {
        return courses.slice(0, 8)
    }

    if (!isAuthenticated) {
        return (
            <div className="my-learning-page">
                <div className="my-learning-empty">
                    <h2>Please log in to access your learning</h2>
                    <p>Sign in to see personalized recommendations</p>
                </div>
            </div>
        )
    }

    return (
        <div className="my-learning-page">
            {/* Hero Section */}
            <section className="ml-hero">
                <div className="ml-hero-content">
                    <h1>My Learning</h1>
                    <p>Welcome back, {user?.name?.split(' ')[0]}! Continue your learning journey.</p>
                </div>
            </section>

            {/* Recommended For You - Collaborative Filtering */}
            <section className="ml-section">
                <div className="ml-section-header">
                    <h2>🎯 Recommended For You</h2>
                    <span className="ml-badge collab">Collaborative Filtering</span>
                </div>
                {isLoading ? (
                    <div className="ml-loading">Loading recommendations...</div>
                ) : (
                    <div className="ml-video-grid">
                        {getCollabCourses().map((course) => (
                            <VideoCard key={course.course_id} course={course} />
                        ))}
                    </div>
                )}
            </section>

            {/* Popular Right Now */}
            <section className="ml-section">
                <div className="ml-section-header">
                    <h2>🔥 Popular Right Now</h2>
                </div>
                {isLoading ? (
                    <div className="ml-loading">Loading...</div>
                ) : (
                    <div className="ml-video-grid">
                        {getPopularCourses().map((course) => (
                            <VideoCard key={course.course_id} course={course} />
                        ))}
                    </div>
                )}
            </section>

            {/* New Courses */}
            <section className="ml-section">
                <div className="ml-section-header">
                    <h2>✨ New Courses</h2>
                </div>
                {isLoading ? (
                    <div className="ml-loading">Loading...</div>
                ) : (
                    <div className="ml-video-grid">
                        {getNewCourses().map((course) => (
                            <VideoCard key={course.course_id} course={course} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

// Video Card Component
const VideoCard = ({ course }) => {
    const videoId = getVideoId(course.youtube_url)
    const thumbnail = videoId
        ? getThumbnail(course.youtube_url)
        : null

    return (
        <Link to={`/course/${course.course_id}`} className="video-card">
            <div className="video-thumbnail">
                {thumbnail ? (
                    <img src={thumbnail} alt={course.title} />
                ) : (
                    <div className="video-placeholder">
                        <span>🎬</span>
                    </div>
                )}
                <div className="video-overlay">
                    <span className="play-icon">▶</span>
                </div>
            </div>
            <div className="video-info">
                <h3 className="video-title">{course.title}</h3>
                <p className="video-instructor">{course.instructor}</p>
                <div className="video-meta">
                    <span className="video-category">{course.category}</span>
                    <span className="video-level">{course.level}</span>
                </div>
            </div>
        </Link>
    )
}

export default MyLearning
