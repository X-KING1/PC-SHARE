// LearnHub Home Page - Udemy 2024 Style
// Different views for visitors vs logged-in users
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetCoursesQuery, useGetRecommendationsQuery } from '../store/api/courseApi'
import useAuth from '../hooks/useAuth'
import CourseCard from '../components/CourseCard'

// Category cards data with colorful backgrounds
const categoryCards = [
    {
        name: 'AI & Machine Learning',
        image: '🧠',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        link: '/courses?category=Machine%20Learning'
    },
    {
        name: 'Web Development',
        image: '💻',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        link: '/courses?category=Web%20Development'
    },
    {
        name: 'Data Science',
        image: '📊',
        gradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
        link: '/courses?category=Data%20Science'
    }
]

const Home = () => {
    const { data, isLoading, isError } = useGetCoursesQuery({ page: 1, limit: 20 })
    // Get recommendations based on course ID 1 (or any popular course)
    const { data: recommendations, isLoading: recLoading, isError: recError } = useGetRecommendationsQuery(1)
    const { user, isAuthenticated } = useAuth()
    const sliderRef = useRef(null)
    const collaborativeRef = useRef(null)
    const [activeSlide, setActiveSlide] = useState(0)

    const scrollLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' })
        }
    }

    const scrollRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' })
        }
    }

    const scrollCollaborativeLeft = () => {
        if (collaborativeRef.current) {
            collaborativeRef.current.scrollBy({ left: -320, behavior: 'smooth' })
        }
    }

    const scrollCollaborativeRight = () => {
        if (collaborativeRef.current) {
            collaborativeRef.current.scrollBy({ left: 320, behavior: 'smooth' })
        }
    }

    // Different home for logged-in users
    if (isAuthenticated) {
        // Get user initials for avatar
        const getInitials = (name) => {
            if (!name) return 'U';
            const parts = name.split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return name.substring(0, 2).toUpperCase();
        };

        return (
            <div className="home-page logged-in">
                {/* Welcome Header - Udemy Style */}
                <section className="welcome-header">
                    <div className="welcome-header-content">
                        <div className="user-avatar">
                            {getInitials(user?.name)}
                        </div>
                        <div className="welcome-text">
                            <h2>Welcome back, {user?.name?.split(' ')[0] || 'Learner'}</h2>
                            <Link to="/dashboard" className="add-interests-link">
                                Add occupation and interests
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Hero Banner - Learning that gets you */}
                <section className="logged-hero-section">
                    <div className="logged-hero-banner">
                        <img src="/hero-person.png" alt="Learning" className="hero-banner-img" onError={(e) => {
                            e.target.style.display = 'none';
                        }} />
                        <div className="hero-text-box">
                            <h1>Learning that<br />gets you</h1>
                            <p>Skills for your present (and your future). Get started with us.</p>
                        </div>
                    </div>
                </section>

                {/* Similar Courses - Content-Based Filtering */}
                <section className="udemy-courses-section">
                    <div className="section-container">
                        <div className="section-header">
                            <div className="section-title-group">
                                <h2><strong>Similar Courses</strong></h2>
                                <p className="section-subtitle">Content-based recommendations matching your interests</p>
                            </div>
                            <div className="slider-controls">
                                <button onClick={scrollLeft} className="slider-btn">←</button>
                                <button onClick={scrollRight} className="slider-btn">→</button>
                            </div>
                        </div>

                        {recLoading ? (
                            <div className="slider-loading">
                                <div className="spinner"></div>
                                <p>Loading similar courses...</p>
                            </div>
                        ) : recError ? (
                            <div className="slider-error">Failed to load recommendations</div>
                        ) : (
                            <div className="slider-track" ref={sliderRef}>
                                {recommendations?.similar_courses?.slice(0, 10).map((course) => (
                                    <div key={course.course_id} className="slider-card">
                                        <CourseCard course={course} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Recommended For You - Collaborative Filtering */}
                <section className="udemy-courses-section collaborative">
                    <div className="section-container">
                        <div className="section-header">
                            <div className="section-title-group">
                                <h2><strong>Recommended For You</strong></h2>
                                <p className="section-subtitle">Based on what learners like you are watching</p>
                            </div>
                            <div className="slider-controls">
                                <button onClick={scrollCollaborativeLeft} className="slider-btn">←</button>
                                <button onClick={scrollCollaborativeRight} className="slider-btn">→</button>
                            </div>
                        </div>

                        {recLoading ? (
                            <div className="slider-loading">
                                <div className="spinner"></div>
                                <p>Loading recommendations...</p>
                            </div>
                        ) : recError ? (
                            <div className="slider-error">Failed to load recommendations</div>
                        ) : (
                            <div className="slider-track" ref={collaborativeRef}>
                                {recommendations?.recommended_for_you?.slice(0, 10).map((course) => (
                                    <div key={course.course_id} className="slider-card">
                                        <CourseCard course={course} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Business Banner */}
                <section className="business-banner">
                    <div className="business-banner-content">
                        <p><strong>Training 2 or more people?</strong> Get your team access to SmartElearn's top 30,000+ courses</p>
                        <div className="business-banner-actions">
                            <Link to="/courses" className="btn-business">Get SmartElearn Business</Link>
                            <button className="btn-dismiss">Dismiss</button>
                        </div>
                    </div>
                </section>
            </div>
        )
    }

    // Visitor Home - Udemy 2024 Style
    return (
        <div className="home-page">
            {/* Hero Section - Udemy Style */}
            <section className="udemy-hero">
                <div className="udemy-hero-content">
                    <div className="udemy-hero-text">
                        <h1>Learning made easy</h1>
                        <p>Build new skills for today and for the future. Let's get learning.</p>
                        <div className="udemy-hero-buttons">
                            <Link to="/courses" className="btn-udemy-primary">
                                Continue learning
                            </Link>
                            <Link to="/courses" className="btn-udemy-secondary">
                                Browse courses
                            </Link>
                        </div>
                    </div>
                    <div className="udemy-hero-image">
                        <div className="hero-illustration">👨‍💻</div>
                    </div>
                </div>
            </section>




            {/* Skills & Courses Section - Udemy Style */}
            <section className="udemy-courses-section">
                <div className="section-container">
                    <div className="section-header-main">
                        <h2>Skills to transform your career and life</h2>
                        <p>From critical skills to technical topics, LearnHub supports your professional development.</p>
                    </div>
                    <div className="section-header">
                        <h3>Featured Courses</h3>
                        <div className="slider-controls">
                            <button onClick={scrollLeft} className="slider-btn">←</button>
                            <button onClick={scrollRight} className="slider-btn">→</button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="slider-loading">
                            <div className="spinner"></div>
                            <p>Loading courses...</p>
                        </div>
                    ) : isError ? (
                        <div className="slider-error">Failed to load courses</div>
                    ) : (
                        <div className="slider-track" ref={sliderRef}>
                            {data?.courses?.map((course) => (
                                <div key={course.course_id} className="slider-card">
                                    <CourseCard course={course} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Trusted Companies */}
            <section className="trusted-section">
                <div className="trusted-container">
                    <p className="trusted-text">Trusted by over <strong>5,000+</strong> learners and <strong>leading</strong> organizations across Nepal</p>
                    <div className="trusted-logos">
                        <span>NCell</span>
                        <span>NTC</span>
                        <span>Nabil Bank</span>
                        <span>Daraz</span>
                        <span>F1Soft</span>
                        <span>Leapfrog</span>
                        <span>Cotiviti</span>
                        <span>Fusemachines</span>
                    </div>
                </div>
            </section>
            {/* Certification Section - Dark Theme */}
            <section className="certification-section">
                <div className="certification-container">
                    <div className="certification-content">
                        <h2><span className="cert-highlight">Get</span> certified and get ahead in your career</h2>
                        <p>Prep for certifications with comprehensive courses, practice tests, and special offers on exam vouchers.</p>
                        <Link to="/courses" className="certification-link">
                            Explore certifications and vouchers →
                        </Link>
                    </div>
                    <div className="certification-cards">
                        <div className="cert-card">
                            <img src="/comptia-badge.png" alt="CompTIA" className="cert-badge-img" />
                            <h3>CompTIA</h3>
                            <p>Cloud, Networking, Cybersecurity</p>
                        </div>
                        <div className="cert-card">
                            <img src="/aws-badge.png" alt="AWS" className="cert-badge-img" />
                            <h3>AWS</h3>
                            <p>Cloud, AI, Coding, Networking</p>
                        </div>
                        <div className="cert-card">
                            <img src="/pmi-badge.png" alt="PMI" className="cert-badge-img" />
                            <h3>PMI</h3>
                            <p>Project & Program Management</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section - Udemy Style */}
            <section className="testimonials-section">
                <div className="testimonials-container">
                    <h2>Join others transforming their lives through learning</h2>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="quote-icon">"</div>
                            <p className="testimonial-text">
                                LearnHub was rated the <strong>most helpful platform</strong> for learning programming according to our student surveys.
                            </p>
                            <div className="testimonial-source">
                                <span className="source-logo">📊</span>
                                <span className="source-name">Student Survey 2024</span>
                            </div>
                            <Link to="/courses?category=Programming" className="testimonial-link">
                                View Programming courses →
                            </Link>
                        </div>

                        <div className="testimonial-card">
                            <div className="quote-icon">"</div>
                            <p className="testimonial-text">
                                LearnHub was truly a <strong>game-changer</strong> for me. The AI recommendations helped me find exactly what I needed.
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">👨‍💻</div>
                                <div className="author-info">
                                    <span className="author-name">Alex Kumar</span>
                                    <span className="author-role">Software Developer</span>
                                </div>
                            </div>
                            <Link to="/courses?category=Web%20Development" className="testimonial-link">
                                View Web Dev courses →
                            </Link>
                        </div>

                        <div className="testimonial-card">
                            <div className="quote-icon">"</div>
                            <p className="testimonial-text">
                                The courses gave me the ability to be persistent. I learned <strong>exactly what I needed</strong> to advance my career.
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">👩‍🔬</div>
                                <div className="author-info">
                                    <span className="author-name">Sarah Chen</span>
                                    <span className="author-role">Data Analyst at TechCorp</span>
                                </div>
                            </div>
                            <Link to="/courses?category=Data%20Science" className="testimonial-link">
                                View Data Science courses →
                            </Link>
                        </div>

                        <div className="testimonial-card">
                            <div className="quote-icon">"</div>
                            <p className="testimonial-text">
                                With LearnHub, I was able to <strong>upskill in AI and ML</strong>. The certificates helped drive my career forward.
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">👨‍🎓</div>
                                <div className="author-info">
                                    <span className="author-name">Michael Raj</span>
                                    <span className="author-role">ML Engineer</span>
                                </div>
                            </div>
                            <Link to="/courses?category=Machine%20Learning" className="testimonial-link">
                                View AI courses →
                            </Link>
                        </div>
                    </div>
                    <Link to="/courses" className="view-all-link">View all stories →</Link>
                </div>
            </section>

            {/* Footer - Explore Skills Section */}
            <footer className="site-footer">
                <div className="footer-top">
                    <p>Top companies choose <Link to="/courses" className="footer-highlight">LearnHub</Link> to build in-demand career skills.</p>
                    <div className="footer-logos">
                        <span>NCell</span>
                        <span>NTC</span>
                        <span>Nabil Bank</span>
                        <span>F1Soft</span>
                    </div>
                </div>

                <div className="footer-skills">
                    <h3>Explore top skills and certifications</h3>
                    <div className="footer-grid">
                        <div className="footer-column">
                            <h4>In-demand Careers</h4>
                            <Link to="/courses?search=data%20scientist">Data Scientist</Link>
                            <Link to="/courses?search=web%20developer">Full Stack Web Developer</Link>
                            <Link to="/courses?search=cloud">Cloud Engineer</Link>
                            <Link to="/courses?search=project%20manager">Project Manager</Link>
                            <Link to="/courses?search=game%20developer">Game Developer</Link>
                            <Link to="/courses">All Career Accelerators</Link>
                        </div>
                        <div className="footer-column">
                            <h4>Web Development</h4>
                            <Link to="/courses?category=Web%20Development">Web Development</Link>
                            <Link to="/courses?search=javascript">JavaScript</Link>
                            <Link to="/courses?search=react">React JS</Link>
                            <Link to="/courses?search=angular">Angular</Link>
                            <Link to="/courses?search=java">Java</Link>
                        </div>
                        <div className="footer-column">
                            <h4>IT Certifications</h4>
                            <Link to="/courses?search=aws">Amazon AWS</Link>
                            <Link to="/courses?search=cloud">AWS Certified Cloud Practitioner</Link>
                            <Link to="/courses?search=azure">Microsoft Azure Fundamentals</Link>
                            <Link to="/courses?search=kubernetes">Kubernetes</Link>
                        </div>
                        <div className="footer-column">
                            <h4>Leadership</h4>
                            <Link to="/courses?search=leadership">Leadership</Link>
                            <Link to="/courses?search=management">Management Skills</Link>
                            <Link to="/courses?search=project%20management">Project Management</Link>
                            <Link to="/courses?search=productivity">Personal Productivity</Link>
                        </div>
                    </div>
                    <div className="footer-grid">
                        <div className="footer-column">
                            <h4>Certifications by Skill</h4>
                            <Link to="/courses?search=cybersecurity">Cybersecurity Certification</Link>
                            <Link to="/courses?search=project%20management">Project Management Certification</Link>
                            <Link to="/courses?search=cloud">Cloud Certification</Link>
                            <Link to="/courses?search=data%20analytics">Data Analytics Certification</Link>
                            <Link to="/courses">See all Certifications</Link>
                        </div>
                        <div className="footer-column">
                            <h4>Data Science</h4>
                            <Link to="/courses?category=Data%20Science">Data Science</Link>
                            <Link to="/courses?search=python">Python</Link>
                            <Link to="/courses?category=Machine%20Learning">Machine Learning</Link>
                            <Link to="/courses?search=chatgpt">ChatGPT</Link>
                            <Link to="/courses?search=deep%20learning">Deep Learning</Link>
                        </div>
                        <div className="footer-column">
                            <h4>Communication</h4>
                            <Link to="/courses?search=communication">Communication Skills</Link>
                            <Link to="/courses?search=presentation">Presentation Skills</Link>
                            <Link to="/courses?search=speaking">Public Speaking</Link>
                            <Link to="/courses?search=writing">Writing</Link>
                        </div>
                        <div className="footer-column">
                            <h4>Business Analytics</h4>
                            <Link to="/courses?search=excel">Microsoft Excel</Link>
                            <Link to="/courses?search=sql">SQL</Link>
                            <Link to="/courses?search=power%20bi">Microsoft Power BI</Link>
                            <Link to="/courses?search=data%20analysis">Data Analysis</Link>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-bottom-grid">
                        <div className="footer-column">
                            <h4>About</h4>
                            <Link to="/about">About us</Link>
                            <Link to="/careers">Careers</Link>
                            <Link to="/contact">Contact us</Link>
                            <Link to="/blog">Blog</Link>
                        </div>
                        <div className="footer-column">
                            <h4>Discover LearnHub</h4>
                            <Link to="/courses">Get the app</Link>
                            <Link to="/teach">Teach on LearnHub</Link>
                            <Link to="/pricing">Plans and Pricing</Link>
                            <Link to="/affiliate">Affiliate</Link>
                            <Link to="/help">Help and Support</Link>
                        </div>
                        <div className="footer-column">
                            <h4>LearnHub for Business</h4>
                            <Link to="/business">LearnHub Business</Link>
                        </div>
                        <div className="footer-column">
                            <h4>Legal & Accessibility</h4>
                            <Link to="/accessibility">Accessibility statement</Link>
                            <Link to="/privacy">Privacy policy</Link>
                            <Link to="/sitemap">Sitemap</Link>
                            <Link to="/terms">Terms</Link>
                        </div>
                    </div>
                </div>

                <div className="footer-copyright">
                    <div className="footer-brand">
                        <span className="brand-logo">📚</span>
                        <span className="brand-name">SmartElearn</span>
                        <span className="copyright-text">© 2026 SmartElearn, Inc.</span>
                    </div>
                    <div className="footer-actions">
                        <span>Cookie settings</span>
                        <span className="language-btn">🌐 English</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home
