// Auth Callback Page - Handles OAuth redirects
// Redirects to home after GitHub login
import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'

const AuthCallback = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const processed = useRef(false)

    useEffect(() => {
        // Prevent double processing
        if (processed.current) return
        processed.current = true

        const token = searchParams.get('token')
        const userParam = searchParams.get('user')

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam))

                // Store in localStorage
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))

                // Show success toast with unique ID to prevent duplicates
                toast.success('GitHub login successful!', {
                    toastId: 'github-login-success'
                })

                // Redirect to home after short delay
                setTimeout(() => {
                    window.location.href = '/'
                }, 500)
            } catch (error) {
                console.error('Auth callback error:', error)
                toast.error('Login failed. Please try again.', {
                    toastId: 'github-login-error'
                })
                navigate('/')
            }
        } else {
            toast.error('Login failed. Please try again.', {
                toastId: 'github-login-error'
            })
            navigate('/')
        }
    }, [searchParams, navigate])

    return (
        <div className="auth-callback-page">
            <div className="auth-callback-card">
                <div className="spinner"></div>
                <h2>Completing login...</h2>
                <p>Please wait</p>
            </div>
        </div>
    )
}

export default AuthCallback
