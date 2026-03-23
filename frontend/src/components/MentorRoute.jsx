// MentorRoute — Only allows users with role='mentor' to access mentor pages
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const MentorRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }

    if (user?.role !== 'mentor') {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            }}>
                <div style={{
                    background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center',
                    maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                        Mentor Access Only
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                        This page is only accessible to users registered as <strong>Mentors</strong>.
                        If you're a mentor, please register with the "Mentor / Instructor" role.
                    </p>
                    <a href="/" style={{
                        display: 'inline-block', padding: '12px 28px', background: '#5624d0',
                        color: 'white', borderRadius: '10px', textDecoration: 'none',
                        fontWeight: '700', fontSize: '14px'
                    }}>
                        ← Go Home
                    </a>
                </div>
            </div>
        )
    }

    return children
}

export default MentorRoute
