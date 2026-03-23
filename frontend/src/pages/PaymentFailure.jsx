// Payment Failure Page - LearnHub (Tailwind CSS)
// Shown when payment fails or is cancelled
import { useSearchParams, Link } from 'react-router-dom'

const FAILURE_REASONS = {
    canceled: { icon: '🚫', title: 'Payment Cancelled', message: 'You cancelled the payment. No charges were made.' },
    verification_failed: { icon: '⚠️', title: 'Verification Failed', message: 'Payment verification failed. Please contact support.' },
    verification_error: { icon: '❌', title: 'Verification Error', message: 'An error occurred during verification. Please try again.' },
    pending: { icon: '⏳', title: 'Payment Pending', message: 'Your payment is still pending. Please wait or try again.' },
    unknown: { icon: '❓', title: 'Payment Failed', message: 'Something went wrong. Please try again.' }
}

const PaymentFailure = () => {
    const [searchParams] = useSearchParams()
    const reason = searchParams.get('reason') || 'unknown'
    const info = FAILURE_REASONS[reason] || FAILURE_REASONS.unknown

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full p-8 text-center">
                {/* Failure Icon */}
                <div className="text-6xl mb-4">{info.icon}</div>

                <h1 className="text-2xl font-bold text-white mb-2">{info.title}</h1>
                <p className="text-gray-400 mb-8">{info.message}</p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Link
                        to="/courses"
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        🔄 Try Again
                    </Link>
                    <Link
                        to="/"
                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default PaymentFailure
