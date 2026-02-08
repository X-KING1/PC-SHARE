// TuneCasa Navbar Component Pattern
// Navbar with login/signup modal popups
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { ROUTES } from '../constants'
import { useGetCategoriesQuery } from '../store/api/courseApi'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isExploreOpen, setIsExploreOpen] = useState(false)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()

    // Fetch categories from database
    const { data: categories = [] } = useGetCategoriesQuery()

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/courses?search=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleCategoryClick = (category) => {
        setIsExploreOpen(false)
        navigate(`/courses?category=${encodeURIComponent(category)}`)
    }

    // Switch between modals
    const handleSwitchToRegister = () => {
        setIsLoginModalOpen(false)
        setIsRegisterModalOpen(true)
    }

    const handleSwitchToLogin = () => {
        setIsRegisterModalOpen(false)
        setIsLoginModalOpen(true)
    }

    return (
        <>
            <nav className="udemy-navbar">
                <div className="navbar-inner">
                    {/* Logo */}
                    <Link to={ROUTES.HOME} className="navbar-brand">
                        <span className="brand-text">SmartElearn</span>
                    </Link>

                    {/* Explore Button with Dropdown */}
                    <div
                        className="explore-wrapper"
                        onMouseEnter={() => setIsExploreOpen(true)}
                        onMouseLeave={() => setIsExploreOpen(false)}
                    >
                        <button className="explore-btn">
                            Explore
                        </button>

                        {/* Category Dropdown */}
                        {isExploreOpen && (
                            <div className="mega-menu">
                                <div className="mega-menu-inner">
                                    <div className="mega-column full-width">
                                        <h3 className="mega-title">Browse Categories</h3>
                                        <div className="category-grid">
                                            {categories.map((category, index) => (
                                                <button
                                                    key={index}
                                                    className="category-btn"
                                                    onClick={() => handleCategoryClick(category)}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mega-footer">
                                    <span>Not sure where to begin?</span>
                                    <Link to="/courses">Browse all courses</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search Bar */}
                    <form className="search-form" onSubmit={handleSearch}>
                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="What do you want to learn?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <button type="submit" className="search-btn">
                                🔍
                            </button>
                        </div>
                    </form>

                    {/* Right Section */}
                    <div className="navbar-right">
                        {isAuthenticated ? (
                            <>
                                <Link to="/my-learning" className="nav-link">
                                    My Learning
                                </Link>
                                <Link to={ROUTES.DASHBOARD} className="user-btn">
                                    <div className="user-avatar-sm">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                </Link>
                                <button onClick={logout} className="btn-logout-sm">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsLoginModalOpen(true)}
                                    className="btn-login-udemy"
                                >
                                    Log in
                                </button>
                                <button
                                    onClick={() => setIsRegisterModalOpen(true)}
                                    className="btn-signup-udemy"
                                >
                                    Sign up
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-toggle"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="mobile-dropdown">
                        <form className="mobile-search" onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Search for anything"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>

                        {/* Mobile Categories */}
                        <p className="mobile-section-title">Categories</p>
                        {categories.slice(0, 6).map((category, index) => (
                            <button
                                key={index}
                                className="mobile-category-btn"
                                onClick={() => {
                                    handleCategoryClick(category)
                                    setIsMenuOpen(false)
                                }}
                            >
                                {category}
                            </button>
                        ))}

                        <Link to="/courses" onClick={() => setIsMenuOpen(false)}>
                            View All Courses
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to={ROUTES.DASHBOARD} onClick={() => setIsMenuOpen(false)}>
                                    My Learning
                                </Link>
                                <button onClick={logout}>Logout</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => {
                                    setIsMenuOpen(false)
                                    setIsLoginModalOpen(true)
                                }}>
                                    Log in
                                </button>
                                <button onClick={() => {
                                    setIsMenuOpen(false)
                                    setIsRegisterModalOpen(true)
                                }}>
                                    Sign up
                                </button>
                            </>
                        )}
                    </div>
                )}
            </nav>

            {/* Login Modal */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSwitchToRegister={handleSwitchToRegister}
            />

            {/* Register Modal */}
            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSwitchToLogin={handleSwitchToLogin}
            />
        </>
    )
}

export default Navbar
