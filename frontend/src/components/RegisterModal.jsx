// TuneCasa Register Modal Component Pattern
// Compact sign up form inside modal popup
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { registerUser, clearError, resetStatus } from '../store/authSlice'
import { STATUS } from '../globals/Status'
import { toast } from 'react-toastify'
import Modal from './Modal'
import config from '../config'

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { status, error } = useSelector((state) => state.auth)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student'
    })
    const [showPassword, setShowPassword] = useState(false)
    const toastShown = useRef(false)

    // Reset status when modal opens
    useEffect(() => {
        if (isOpen) {
            dispatch(resetStatus())
            toastShown.current = false
            setFormData({ name: '', email: '', password: '', role: 'student' })
        }
    }, [isOpen, dispatch])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!formData.name || !formData.email || !formData.password) {
            toast.error('Please fill in all fields')
            return
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        dispatch(registerUser({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
        }))
    }

    // Show success toast only when status changes to SUCCESS
    useEffect(() => {
        if (status === STATUS.SUCCESS && !toastShown.current) {
            toastShown.current = true
            toast.success('Welcome to SmartElearn!', { toastId: 'auth-success' })
            onClose()
            // Redirect mentors to /mentor, students to /
            const authUser = JSON.parse(localStorage.getItem('user') || '{}')
            navigate(authUser.role === 'mentor' ? '/mentor' : '/')
        }
    }, [status, navigate, onClose])

    useEffect(() => {
        if (error && isOpen) {
            toast.error(error, { toastId: 'auth-error' })
            dispatch(clearError())
        }
    }, [error, isOpen, dispatch])

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sign up for SmartElearn">
            <form onSubmit={handleSubmit} className="login-form compact">
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <div className="input-with-icon">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min 6 characters"
                            className="form-input"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="input-icon-btn"
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>I am a</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="form-input"
                    >
                        <option value="student">Student</option>
                        <option value="mentor">Mentor / Instructor</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn-submit"
                    disabled={status === STATUS.LOADING}
                >
                    {status === STATUS.LOADING ? 'Creating...' : 'Sign up'}
                </button>
            </form>

            {/* Divider */}
            <div className="modal-divider compact">
                <span>or</span>
            </div>

            {/* GitHub Signup - use switch endpoint for account selection */}
            <a href={`${config.API_BASE}/api/auth/github/switch`} className="btn-github">
                <svg className="github-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Sign up with GitHub
            </a>

            {/* Switch to Login */}
            <div className="modal-footer-text compact">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="link-btn">Log in</button>
            </div>
        </Modal>
    )
}

export default RegisterModal
