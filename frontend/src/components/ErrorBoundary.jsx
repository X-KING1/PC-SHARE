// TuneCasa Component - ErrorBoundary
// Catches JavaScript errors and shows fallback UI
import { Component } from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center px-6">
                    <div className="glass rounded-2xl p-10 text-center max-w-md">
                        <div className="text-6xl mb-4">😵</div>
                        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-gray-400 mb-6">
                            An unexpected error occurred. Please try again.
                        </p>
                        <div className="space-x-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary"
                            >
                                Refresh Page
                            </button>
                            <Link to="/" className="text-purple-400 hover:text-purple-300">
                                Go Home
                            </Link>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
