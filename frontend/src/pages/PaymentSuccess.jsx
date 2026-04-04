// Payment Success Page - LearnHub (Premium White Design)
// Shown after successful Stripe or Khalti payment
import { useSearchParams, Link } from 'react-router-dom'
import { useGetStripeStatusQuery } from '../store/api/paymentApi'
import { useEffect, useState } from 'react'

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams()
    const [showConfetti, setShowConfetti] = useState(true)

    const sessionId = searchParams.get('session_id')
    const pidx = searchParams.get('pidx')
    const provider = searchParams.get('provider') || (sessionId ? 'stripe' : 'khalti')
    const order = searchParams.get('order')
    const courseId = searchParams.get('course_id')

    const { data: stripeStatus } = useGetStripeStatusQuery(sessionId, {
        skip: !sessionId
    })

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 4000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0fdf4 100%)',
                fontFamily: "'Inter', system-ui, sans-serif"
            }}>

            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', animation: 'float 6s ease-in-out infinite' }} />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, #34d399, transparent)', animation: 'float 8s ease-in-out infinite reverse' }} />
            </div>

            {/* Confetti particles */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `${Math.random() * 100}%`,
                            top: '-10px',
                            width: `${6 + Math.random() * 6}px`,
                            height: `${6 + Math.random() * 6}px`,
                            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                            background: ['#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#f97316'][Math.floor(Math.random() * 6)],
                            animation: `confettiFall ${2 + Math.random() * 3}s ease-out ${Math.random() * 2}s forwards`,
                            opacity: 0.9,
                        }} />
                    ))}
                </div>
            )}

            {/* Main Card */}
            <div className="bg-white rounded-3xl max-w-[440px] w-full p-8 relative z-10 text-center"
                style={{
                    boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
                    animation: 'slideUp 0.6s ease-out'
                }}>

                {/* Success Icon with animated ring */}
                <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full"
                        style={{
                            background: 'linear-gradient(135deg, #dcfce7, #d1fae5)',
                            animation: 'pulse-ring 2s ease-out infinite'
                        }} />
                    <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center"
                        style={{ boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{ animation: 'checkDraw 0.6s ease-out 0.3s both' }}>
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-[24px] font-bold text-neutral-900 mb-1.5 tracking-tight">Payment Successful!</h1>
                <p className="text-neutral-400 text-[14px] mb-6">Your course has been purchased successfully</p>

                {/* Payment Details Card */}
                <div className="rounded-2xl border border-neutral-100 overflow-hidden mb-6"
                    style={{ background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)' }}>

                    {/* Provider */}
                    <div className="flex justify-between items-center px-5 py-3.5">
                        <span className="text-[13px] text-neutral-400 font-medium">Provider</span>
                        <div className="flex items-center gap-2">
                            {provider === 'stripe' ? (
                                <>
                                    <div className="w-6 h-6 rounded-md bg-[#635bff]/10 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#635bff" strokeWidth="2.5">
                                            <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                                        </svg>
                                    </div>
                                    <span className="text-[13px] font-semibold text-neutral-900">Stripe</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-6 h-6 rounded-md bg-[#5C2D91]/10 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-[#5C2D91]">K</span>
                                    </div>
                                    <span className="text-[13px] font-semibold text-neutral-900">Khalti</span>
                                </>
                            )}
                        </div>
                    </div>

                    {stripeStatus && (
                        <>
                            <div className="border-t border-neutral-100" />
                            <div className="flex justify-between items-center px-5 py-3.5">
                                <span className="text-[13px] text-neutral-400 font-medium">Amount</span>
                                <span className="text-[15px] font-bold text-emerald-600">
                                    ${(stripeStatus.amount / 100).toFixed(2)} {stripeStatus.currency?.toUpperCase()}
                                </span>
                            </div>

                            <div className="border-t border-neutral-100" />
                            <div className="flex justify-between items-center px-5 py-3.5">
                                <span className="text-[13px] text-neutral-400 font-medium">Status</span>
                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {stripeStatus.status}
                                </span>
                            </div>
                        </>
                    )}

                    {pidx && (
                        <>
                            <div className="border-t border-neutral-100" />
                            <div className="flex justify-between items-center px-5 py-3.5">
                                <span className="text-[13px] text-neutral-400 font-medium">Transaction</span>
                                <span className="text-[12px] font-mono text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md">{pidx}</span>
                            </div>
                        </>
                    )}

                    {order && (
                        <>
                            <div className="border-t border-neutral-100" />
                            <div className="flex justify-between items-center px-5 py-3.5">
                                <span className="text-[13px] text-neutral-400 font-medium">Order</span>
                                <span className="text-[12px] font-mono text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md">{order}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5">
                    <Link
                        to={courseId ? `/course/${courseId}` : '/purchased-courses'}
                        className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white font-bold text-[14px] rounded-xl transition-all no-underline flex items-center justify-center gap-2 group"
                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                        </svg>
                        {courseId ? 'Go to Course' : 'My Purchased Courses'}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="group-hover:translate-x-0.5 transition-transform">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </Link>
                    <Link
                        to="/courses"
                        className="w-full py-3.5 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-[14px] rounded-xl border-2 border-neutral-200 hover:border-neutral-300 transition-all no-underline flex items-center justify-center gap-2"
                    >
                        Browse More Courses
                    </Link>
                </div>

                {/* Security note */}
                <p className="text-[11px] text-neutral-300 mt-5 flex items-center justify-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Secured by {provider === 'stripe' ? 'Stripe' : 'Khalti'} · Encrypted payment
                </p>
            </div>

            {/* Inline CSS animations */}
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.08); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes checkDraw {
                    from { stroke-dasharray: 30; stroke-dashoffset: 30; }
                    to { stroke-dasharray: 30; stroke-dashoffset: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes confettiFall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
        </div>
    )
}

export default PaymentSuccess
