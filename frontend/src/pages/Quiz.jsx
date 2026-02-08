// TuneCasa Quiz Page Pattern
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSingleQuiz, startQuizAttempt, submitAnswer, completeQuiz, resetQuiz, nextQuestion } from '../store/quizSlice'
import { STATUS } from '../globals/Status'
import { toast } from 'react-toastify'
import useAuth from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'

const Quiz = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentQuiz, currentAttempt, currentQuestion, answers, score, status } = useSelector((state) => state.quiz)
    const { user } = useAuth()
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showResult, setShowResult] = useState(false)

    useEffect(() => {
        if (id) {
            dispatch(fetchSingleQuiz(id))
        }
        return () => dispatch(resetQuiz())
    }, [dispatch, id])

    const handleStartQuiz = () => {
        const userId = user?.user_id || 1
        dispatch(startQuizAttempt(id, userId))
    }

    const handleSubmitAnswer = () => {
        if (!selectedAnswer) {
            toast.warning('Please select an answer')
            return
        }

        const question = currentQuiz.questions[currentQuestion]
        dispatch(submitAnswer(currentAttempt.attempt_id, question.question_id, selectedAnswer))

        if (currentQuestion < currentQuiz.questions.length - 1) {
            dispatch(nextQuestion())
            setSelectedAnswer(null)
        } else {
            dispatch(completeQuiz(currentAttempt.attempt_id))
            setShowResult(true)
        }
    }

    if (status === STATUS.LOADING) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (!currentQuiz) {
        return <div className="text-center py-20">Quiz not found</div>
    }

    // Show result
    if (showResult) {
        const passed = score >= (currentQuiz.passing_score || 70)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass rounded-2xl p-12 text-center max-w-lg animate-fade-in">
                    <div className="text-6xl mb-6">{passed ? '🎉' : '😔'}</div>
                    <h1 className="text-3xl font-bold mb-4">{passed ? 'Congratulations!' : 'Try Again'}</h1>
                    <p className="text-xl text-gray-300 mb-4">Your score: {score} points</p>
                    <p className="text-gray-400 mb-8">
                        {passed
                            ? 'You passed the quiz! You can now get your certificate.'
                            : 'Keep learning and try again.'}
                    </p>
                    <div className="flex gap-4 justify-center">
                        {passed && (
                            <button
                                onClick={() => navigate('/certificate', { state: { quiz: currentQuiz, score } })}
                                className="btn-primary"
                            >
                                Get Certificate
                            </button>
                        )}
                        <button onClick={() => navigate(-1)} className="btn-secondary">
                            Back to Course
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Show start screen
    if (!currentAttempt) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass rounded-2xl p-12 text-center max-w-lg animate-fade-in">
                    <h1 className="text-3xl font-bold mb-4">{currentQuiz.title}</h1>
                    <p className="text-gray-300 mb-6">{currentQuiz.description}</p>
                    <div className="flex justify-center gap-6 mb-8 text-gray-400">
                        <span>⏱️ {currentQuiz.time_limit} min</span>
                        <span>❓ {currentQuiz.questions?.length || 0} questions</span>
                        <span>🎯 Pass: {currentQuiz.passing_score}%</span>
                    </div>
                    <button onClick={handleStartQuiz} className="btn-primary">
                        Start Quiz
                    </button>
                </div>
            </div>
        )
    }

    // Show question
    const question = currentQuiz.questions[currentQuestion]
    const options = ['A', 'B', 'C', 'D']

    return (
        <div className="py-8 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Question {currentQuestion + 1} of {currentQuiz.questions.length}</span>
                        <span>{currentQuiz.title}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full">
                        <div
                            className="h-2 bg-purple-500 rounded-full transition-all"
                            style={{ width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question */}
                <div className="glass rounded-2xl p-8 animate-fade-in">
                    <h2 className="text-2xl font-bold mb-8">{question.question_text}</h2>

                    <div className="space-y-4">
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setSelectedAnswer(opt)}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${selectedAnswer === opt
                                    ? 'border-purple-500 bg-purple-500/20'
                                    : 'border-gray-700 hover:border-gray-600'
                                    }`}
                            >
                                <span className="font-bold mr-3">{opt}.</span>
                                {question[`option_${opt.toLowerCase()}`]}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSubmitAnswer}
                        className="btn-primary w-full mt-8"
                    >
                        {currentQuestion < currentQuiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Quiz
