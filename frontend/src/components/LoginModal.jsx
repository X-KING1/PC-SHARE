// TuneCasa Login Modal Component Pattern
// Login form with Forgot Password inside same modal popup
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser, clearError, resetStatus } from '../store/authSlice'
import { STATUS } from '../globals/Status'
import { toast } from 'react-toastify'
import Modal from './Modal'

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { status, error } = useSelector((state) => state.auth)

    // View: 'login' | 'forgot' | 'reset'
    const [view, setView] = useState('login')
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const toastShown = useRef(false)

    // Reset status when modal opens
    useEffect(() => {
        if (isOpen) {
            dispatch(resetStatus())
            toastShown.current = false
            setFormData({ email: '', password: '', otp: '', newPassword: '', confirmPassword: '' })
            setView('login')
            setIsLoading(false)
        }
    }, [isOpen, dispatch])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // Login submit
    const handleSubmit = (e) => {
        e.preventDefault()

        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields')
            return
        }

        dispatch(loginUser(formData))
    }

    // Request OTP for forgot password
    const handleRequestOTP = async (e) => {
        e.preventDefault()

        if (!formData.email) {
            toast.error('Please enter your email')
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:5000/api/users/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('OTP sent to your email!')
                setView('reset')
            } else {
                toast.error(data.message || 'Failed to send OTP')
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Reset password with OTP
    const handleResetPassword = async (e) => {
        e.preventDefault()

        if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
            toast.error('Please fill in all fields')
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:5000/api/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp,
                    newPassword: formData.newPassword
                })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Password reset successful! Please log in.')
                setView('login')
                setFormData({ ...formData, otp: '', newPassword: '', confirmPassword: '', password: '' })
            } else {
                toast.error(data.message || 'Failed to reset password')
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Show success toast only when status changes to SUCCESS
    useEffect(() => {
        if (status === STATUS.SUCCESS && !toastShown.current) {
            toastShown.current = true
            toast.success('Welcome to SmartElearn!', { toastId: 'auth-success' })
            onClose()
            // Redirect based on role: admin → /admin, mentor → /mentor, student → /
            const authUser = JSON.parse(localStorage.getItem('user') || '{}')
            navigate(authUser.role === 'admin' ? '/admin' : authUser.role === 'mentor' ? '/mentor' : '/')
        }
    }, [status, navigate, onClose])

    useEffect(() => {
        if (error && isOpen) {
            toast.error(error, { toastId: 'auth-error' })
            dispatch(clearError())
        }
    }, [error, isOpen, dispatch])

    // Get modal title based on view
    const getTitle = () => {
        switch (view) {
            case 'forgot': return 'Forgot Password'
            case 'reset': return 'Reset Password'
            default: return 'Log in to SmartElearn'
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
            {/* LOGIN VIEW */}
            {view === 'login' && (
                <>
                    <form onSubmit={handleSubmit} className="login-form">
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
                                    placeholder="Enter your password"
                                    className="form-input"
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="input-icon-btn"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <div className="forgot-password-link">
                                <button type="button" onClick={() => setView('forgot')}>
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={status === STATUS.LOADING}
                        >
                            {status === STATUS.LOADING ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="modal-divider">
                        <span>or</span>
                    </div>

                    {/* GitHub Login */}
                    <a
                        href="http://localhost:5000/api/auth/github/switch"
                        className="btn-github"
                    >
                        <svg className="github-icon" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        Continue with GitHub
                    </a>

                    {/* Switch to Register */}
                    <div className="modal-footer-text">
                        Don't have an account?{' '}
                        <button onClick={onSwitchToRegister} className="link-btn">
                            Sign up
                        </button>
                    </div>
                </>
            )}

            {/* FORGOT PASSWORD VIEW - Enter Email */}
            {view === 'forgot' && (
                <form onSubmit={handleRequestOTP} className="login-form">
                    <p className="modal-subtitle">Enter your email to receive a password reset OTP</p>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="form-input"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send OTP'}
                    </button>

                    <button
                        type="button"
                        className="btn-back"
                        onClick={() => setView('login')}
                    >
                        ← Back to Login
                    </button>
                </form>
            )}

            {/* RESET PASSWORD VIEW - Enter OTP & New Password */}
            {view === 'reset' && (
                <form onSubmit={handleResetPassword} className="login-form">
                    <p className="modal-subtitle">Enter the OTP sent to {formData.email}</p>

                    <div className="form-group">
                        <label>OTP Code</label>
                        <input
                            type="text"
                            name="otp"
                            value={formData.otp}
                            onChange={handleChange}
                            placeholder="Enter 6-digit OTP"
                            className="form-input"
                            maxLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            className="form-input"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            className="form-input"
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <button
                        type="button"
                        className="btn-back"
                        onClick={() => setView('forgot')}
                    >
                        ← Back
                    </button>
                </form>
            )}
        </Modal>
    )
}

export default LoginModal
