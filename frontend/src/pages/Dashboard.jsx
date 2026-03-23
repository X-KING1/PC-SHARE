// TuneCasa Dashboard Page - Enhanced with Animations
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { ROUTES } from '../constants'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
    const { user, isAuthenticated } = useAuth()
    const [stats, setStats] = useState({
        enrolled: 0,
        completed: 0,
        certificates: 0
    })
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        // Trigger animations after component mounts
        setTimeout(() => setIsLoaded(true), 100)
    }, [])

    // Show loading if user data is not ready
    if (!user) {
        return <LoadingSpinner message="Loading dashboard..." />
    }

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return '?'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    // Stats data with icons and gradients
    const statsData = [
        {
            icon: '📚',
            value: stats.enrolled,
            label: 'Courses Enrolled',
            gradient: 'from-blue-500 to-cyan-400',
            delay: 0
        },
        {
            icon: '✅',
            value: stats.completed,
            label: 'Completed',
            gradient: 'from-green-500 to-emerald-400',
            delay: 100
        },
        {
            icon: '🏆',
            value: stats.certificates,
            label: 'Certificates',
            gradient: 'from-yellow-500 to-orange-400',
            delay: 200
        },
        {
            icon: '⭐',
            value: user.skill_level || 'N/A',
            label: 'Skill Level',
            gradient: 'from-purple-500 to-pink-400',
            delay: 300
        }
    ]

    // Quick action buttons
    const quickActions = [
        { icon: '🛒', label: 'Purchased Courses', to: '/purchased-courses', color: 'green' },
        { icon: '🎓', label: 'Browse Courses', to: ROUTES.COURSES, color: 'purple' },
        { icon: '📜', label: 'Certificates', to: '/certificate', color: 'yellow' },
        { icon: '📖', label: 'My Learning', to: '/my-learning', color: 'blue' },
        { icon: '💬', label: 'Forum', to: '/forum', color: 'orange' },
    ]

    return (
        <div className="dashboard-page">
            {/* Animated Background */}
            <div className="dashboard-bg">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
                <div className="bg-orb bg-orb-3"></div>
            </div>

            <div className="dashboard-content">
                {/* Welcome Header with Avatar */}
                <div className={`welcome-card ${isLoaded ? 'animate-in' : ''}`}>
                    <div className="welcome-left">
                        <div className="avatar-ring">
                            <div className="avatar-inner">
                                {getInitials(user.name)}
                            </div>
                        </div>
                        <div className="welcome-text">
                            <p className="greeting">Welcome back,</p>
                            <h1 className="user-name">{user.name}! 👋</h1>
                            <p className="tagline">Ready to continue your learning journey?</p>
                        </div>
                    </div>
                    <div className="welcome-right">
                        <div className="streak-badge">
                            <span className="streak-icon">🔥</span>
                            <span className="streak-text">7 Day Streak</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid with Staggered Animation */}
                <div className="stats-grid">
                    {statsData.map((stat, index) => (
                        <div
                            key={index}
                            className={`stat-card ${isLoaded ? 'animate-in' : ''}`}
                            style={{ animationDelay: `${stat.delay}ms` }}
                        >
                            <div className={`stat-icon-wrapper bg-gradient-to-br ${stat.gradient}`}>
                                <span className="stat-icon">{stat.icon}</span>
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                            <div className={`stat-glow bg-gradient-to-br ${stat.gradient}`}></div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-grid">
                    {/* Profile Card */}
                    <div className={`profile-card ${isLoaded ? 'animate-in' : ''}`} style={{ animationDelay: '400ms' }}>
                        <div className="card-header">
                            <h2>👤 Your Profile</h2>
                            <button className="edit-btn">Edit</button>
                        </div>
                        <div className="profile-details">
                            <div className="profile-item">
                                <span className="profile-label">Full Name</span>
                                <span className="profile-value">{user.name}</span>
                            </div>
                            <div className="profile-item">
                                <span className="profile-label">Email Address</span>
                                <span className="profile-value">{user.email}</span>
                            </div>
                            <div className="profile-item">
                                <span className="profile-label">Skill Level</span>
                                <span className="profile-value skill-badge">{user.skill_level || 'Beginner'}</span>
                            </div>
                            <div className="profile-item">
                                <span className="profile-label">Member ID</span>
                                <span className="profile-value">#{user.user_id}</span>
                            </div>
                        </div>
                        <div className="profile-progress">
                            <div className="progress-header">
                                <span>Profile Completion</span>
                                <span className="progress-percent">75%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className={`actions-card ${isLoaded ? 'animate-in' : ''}`} style={{ animationDelay: '500ms' }}>
                        <div className="card-header">
                            <h2>⚡ Quick Actions</h2>
                        </div>
                        <div className="actions-grid">
                            {quickActions.map((action, index) => (
                                <Link
                                    key={index}
                                    to={action.to}
                                    className={`action-btn action-${action.color}`}
                                >
                                    <span className="action-icon">{action.icon}</span>
                                    <span className="action-label">{action.label}</span>
                                    <span className="action-arrow">→</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className={`activity-card ${isLoaded ? 'animate-in' : ''}`} style={{ animationDelay: '600ms' }}>
                    <div className="card-header">
                        <h2>📊 Recent Activity</h2>
                        <Link to="/my-learning" className="view-all-link">View All →</Link>
                    </div>
                    <div className="activity-empty">
                        <div className="empty-illustration">
                            <span className="empty-icon">📖</span>
                        </div>
                        <h3>Start Your Learning Journey</h3>
                        <p>Explore courses and begin building new skills today!</p>
                        <Link to={ROUTES.COURSES} className="start-btn">
                            <span>Browse Courses</span>
                            <span className="btn-shine"></span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
