// TuneCasa Certificate Page Pattern
import { useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Certificate = () => {
    const location = useLocation()
    const { user } = useAuth()
    const { quiz, score } = location.state || {}

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const certificateId = `LH-${Date.now().toString(36).toUpperCase()}`

    return (
        <div className="py-8 px-6 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                {/* Certificate */}
                <div id="certificate" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-3xl p-12 border-4 border-yellow-500/30 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-yellow-500 text-sm font-bold tracking-widest mb-2">CERTIFICATE OF COMPLETION</div>
                        <h1 className="text-4xl font-bold text-white">LearnHub Academy</h1>
                    </div>

                    {/* Ribbon */}
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mb-8"></div>

                    {/* Content */}
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-lg mb-4">This is to certify that</p>
                        <h2 className="text-5xl font-bold text-white mb-4">{user?.name || 'Student Name'}</h2>
                        <p className="text-gray-400 text-lg mb-8">has successfully completed</p>
                        <h3 className="text-3xl font-bold text-purple-400 mb-4">{quiz?.title || 'Course Quiz'}</h3>
                        <p className="text-xl text-gray-300">with a score of <span className="text-yellow-500 font-bold">{score || 0} points</span></p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-end mt-12 pt-8 border-t border-gray-700">
                        <div>
                            <p className="text-gray-500 text-sm">Date Issued</p>
                            <p className="text-white font-medium">{currentDate}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-2">🏆</div>
                            <p className="text-gray-500 text-sm">Excellence Award</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 text-sm">Certificate ID</p>
                            <p className="text-white font-mono">{certificateId}</p>
                        </div>
                    </div>
                </div>

                {/* Download Button */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => window.print()}
                        className="btn-primary"
                    >
                        📥 Download Certificate
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Certificate
