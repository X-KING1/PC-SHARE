import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, LayoutGroup } from 'framer-motion'
import { fetchSingleQuiz, startQuizAttempt, submitAnswer, completeQuiz, resetQuiz, nextQuestion } from '../store/quizSlice'
import { STATUS } from '../globals/Status'
import { toast } from 'react-toastify'
import useAuth from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'

// Gamification imports
import QuizCard from '../components/quiz/QuizCard'
import ResultPopup from '../components/quiz/ResultPopup'
import RewardsSidebar from '../components/quiz/RewardsSidebar'
import LevelUnlockAnimation from '../components/quiz/LevelUnlockAnimation'
import GamifiedFinalResults from '../components/quiz/GamifiedFinalResults'
import { buildLevelSystem, getCurrentLevel, getDifficulty } from '../data/quizLevelSystem'
import { triggerSuccessConfetti, triggerConfetti } from '../animations/confetti'

const Quiz = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentQuiz, currentAttempt, currentQuestion, answers, score, status, alreadyCompleted, previousAnswers, reviewInfo } = useSelector((state) => state.quiz)
    const { user } = useAuth()

    // Gamification state
    const [levelScores, setLevelScores] = useState({ 1: 0, 2: 0, 3: 0 })
    const [earnedBadges, setEarnedBadges] = useState([])
    const [recentBadge, setRecentBadge] = useState(null)
    const [showLevelUnlock, setShowLevelUnlock] = useState(false)
    const [unlockedLevel, setUnlockedLevel] = useState(null)
    const [showResultPopup, setShowResultPopup] = useState(false)
    const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false)
    const [lastCorrectText, setLastCorrectText] = useState(null)
    const [quizComplete, setQuizComplete] = useState(false)

    // Build dynamic level system from quiz data
    const levelSystem = useMemo(() => {
        if (!currentQuiz?.questions?.length) return null
        return buildLevelSystem(currentQuiz.questions)
    }, [currentQuiz])

    useEffect(() => {
        // Reset all gamification state when quiz changes (e.g. Easy → Medium → Hard)
        setLevelScores({ 1: 0, 2: 0, 3: 0 })
        setEarnedBadges([])
        setRecentBadge(null)
        setShowLevelUnlock(false)
        setUnlockedLevel(null)
        setShowResultPopup(false)
        setLastAnswerCorrect(false)
        setLastCorrectText(null)
        setQuizComplete(false)

        if (id) dispatch(fetchSingleQuiz(id))
        return () => dispatch(resetQuiz())
    }, [dispatch, id])

    useEffect(() => {
        if (currentQuiz && !currentAttempt && !quizComplete) {
            const userId = user?.user_id || 1
            dispatch(startQuizAttempt(id, userId))
        }
    }, [currentQuiz, currentAttempt, quizComplete])

    // Auto-complete quiz if question index goes out of bounds
    useEffect(() => {
        if (currentQuiz && currentAttempt && !quizComplete &&
            currentQuestion >= currentQuiz.questions.length) {
            dispatch(completeQuiz(currentAttempt.attempt_id))
            setQuizComplete(true)
        }
    }, [currentQuestion, currentQuiz, currentAttempt, quizComplete])

    // Map real DB question to gamification format
    const buildGameQuestion = (q, index) => ({
        question: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
        correctAnswer: ['A', 'B', 'C', 'D'].indexOf(q.correct_answer?.toUpperCase()),
        difficulty: levelSystem ? getDifficulty(index, levelSystem) : 'moderate'
    })

    const handleAnswer = async (selectedOptionIndex) => {
        if (!currentQuiz) return
        const question = currentQuiz.questions[currentQuestion]
        const gameQ = buildGameQuestion(question, currentQuestion)
        const optionLetters = ['A', 'B', 'C', 'D']
        const selectedLetter = optionLetters[selectedOptionIndex]

        const correct = selectedOptionIndex === gameQ.correctAnswer
        setLastAnswerCorrect(correct)
        setLastCorrectText(correct ? null : gameQ.options[gameQ.correctAnswer])

        // Submit to backend
        dispatch(submitAnswer(currentAttempt.attempt_id, question.question_id, selectedLetter))

        if (correct) {
            triggerSuccessConfetti()
            const currentLevel = getCurrentLevel(currentQuestion, levelSystem)
            setLevelScores(prev => ({ ...prev, [currentLevel]: prev[currentLevel] + 1 }))
        }

        setShowResultPopup(true)
    }

    const handleNext = () => {
        setShowResultPopup(false)

        if (!levelSystem) return

        const currentLevel = getCurrentLevel(currentQuestion, levelSystem)
        const levelData = levelSystem[`level${currentLevel}`]

        // Check if this is the last question of the level
        if (currentQuestion === levelData.endIndex) {
            const levelScore = levelScores[currentLevel]
            if (levelScore >= levelData.passingScore) {
                setUnlockedLevel(levelData)
                setRecentBadge(levelData)
                setEarnedBadges(prev => [...prev, levelData])
                setShowLevelUnlock(true)
                triggerConfetti()
                return
            }
        }

        // Move to next question or finish
        if (currentQuestion < currentQuiz.questions.length - 1) {
            dispatch(nextQuestion())
        } else {
            dispatch(completeQuiz(currentAttempt.attempt_id))
            setQuizComplete(true)
        }
    }

    const handleLevelUnlockContinue = () => {
        setShowLevelUnlock(false)
        setTimeout(() => setRecentBadge(null), 800)

        if (currentQuestion < currentQuiz.questions.length - 1) {
            dispatch(nextQuestion())
        } else {
            dispatch(completeQuiz(currentAttempt.attempt_id))
            setQuizComplete(true)
        }
    }

    const handleRestart = () => {
        setLevelScores({ 1: 0, 2: 0, 3: 0 })
        setEarnedBadges([])
        setRecentBadge(null)
        setShowLevelUnlock(false)
        setUnlockedLevel(null)
        setShowResultPopup(false)
        setQuizComplete(false)
        dispatch(resetQuiz())
        if (id) dispatch(fetchSingleQuiz(id))
    }

    // ─── Loading states ───────────────────────────────────────────
    if (status === STATUS.LOADING) return <LoadingSpinner message="Loading quiz..." />

    if (!currentQuiz) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                <div className="text-center px-6">
                    <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <h2 className="text-[22px] font-bold text-neutral-900 mb-1.5">Quiz not found</h2>
                    <p className="text-neutral-400 text-[14px] mb-5">The quiz you're looking for doesn't exist.</p>
                    <Link to="/purchased-courses"
                        className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors no-underline">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back to Courses
                    </Link>
                </div>
            </div>
        )
    }

    if (!currentAttempt && !quizComplete && !alreadyCompleted) {
        return <LoadingSpinner message="Starting quiz..." />
    }

    // ─── Review Mode: Same format, read-only ──────────────────────
    if (alreadyCompleted && currentQuiz) {
        const reviewQ = currentQuiz.questions?.[currentQuestion]
        const reviewGameQ = reviewQ ? buildGameQuestion(reviewQ, currentQuestion) : null
        const reviewLevel = levelSystem && reviewQ ? getCurrentLevel(currentQuestion, levelSystem) : 1
        const reviewLevelData = levelSystem?.[`level${reviewLevel}`]
        const reviewQInLevel = reviewLevelData && reviewQ ? currentQuestion - reviewLevelData.startIndex + 1 : currentQuestion + 1
        const reviewTotalInLevel = reviewLevelData?.totalQuestions || currentQuiz.questions.length
        const prevAnswer = previousAnswers.find(a => a.question_id === reviewQ?.question_id)

        // Compute badges from previousAnswers
        const reviewLevelScores = { 1: 0, 2: 0, 3: 0 }
        const reviewEarnedBadges = []
        if (levelSystem && currentQuiz.questions) {
            currentQuiz.questions.forEach((q, idx) => {
                const ans = previousAnswers.find(a => a.question_id === q.question_id)
                if (ans?.is_correct) {
                    const lvl = getCurrentLevel(idx, levelSystem)
                    reviewLevelScores[lvl] = (reviewLevelScores[lvl] || 0) + 1
                }
            })
            // Check which levels were passed
            for (let lvl = 1; lvl <= 3; lvl++) {
                const ld = levelSystem[`level${lvl}`]
                if (ld && reviewLevelScores[lvl] >= ld.passingScore) {
                    reviewEarnedBadges.push(ld)
                }
            }
        }

        return (
            <LayoutGroup>
                <div className="min-h-screen bg-neutral-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                    {/* Same header bar */}
                    <div className="bg-white border-b border-neutral-200">
                        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate(-1)}
                                    className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-900 text-[13px] font-medium transition-colors">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                    Back
                                </button>
                                <span className="w-px h-5 bg-neutral-200" />
                                <span className="text-[13px] text-neutral-900 font-semibold truncate max-w-[300px]">{currentQuiz.title}</span>
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ml-2 ${reviewInfo?.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                    {reviewInfo?.passed ? '✅ Passed · Review' : `❌ ${reviewInfo?.attempts_used || 3}/${reviewInfo?.max_attempts || 3} Attempts · Review`}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[12px] text-neutral-400 font-medium">
                                    Question {currentQuestion + 1} of {currentQuiz.questions.length}
                                </span>
                                <div className="w-32 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Same two-column layout */}
                    <div className="max-w-[1400px] mx-auto px-4 py-8">
                        <div className="flex gap-6 items-start">
                            {/* Left: Question card */}
                            <div className="flex-1 min-w-0">
                                {reviewGameQ && (
                                    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-5">
                                            <span className="text-[12px] font-bold text-neutral-400 uppercase tracking-wider">
                                                Level {reviewLevel} · Q{reviewQInLevel}/{reviewTotalInLevel}
                                            </span>
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                                reviewLevel === 3 ? 'bg-red-50 text-red-600' :
                                                reviewLevel === 2 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {reviewLevel === 3 ? 'Hard' : reviewLevel === 2 ? 'Medium' : 'Easy'}
                                            </span>
                                        </div>
                                        <h3 className="text-[17px] font-semibold text-neutral-900 leading-relaxed mb-6">{reviewGameQ.question}</h3>
                                        <div className="space-y-3">
                                            {reviewGameQ.options.map((opt, i) => {
                                                const label = ['A', 'B', 'C', 'D'][i]
                                                const isUserChoice = prevAnswer?.selected_answer?.toUpperCase() === label
                                                const isCorrectOpt = (prevAnswer?.correct_answer?.toUpperCase() || reviewQ.correct_answer?.toUpperCase()) === label
                                                let cls = 'border-neutral-200 bg-white'
                                                let lblCls = 'bg-neutral-100 text-neutral-500'
                                                let txtCls = 'text-neutral-700'
                                                let icon = null
                                                if (isCorrectOpt) {
                                                    cls = 'border-emerald-300 bg-emerald-50'
                                                    lblCls = 'bg-emerald-500 text-white'
                                                    txtCls = 'text-emerald-800'
                                                    icon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                }
                                                if (isUserChoice && !isCorrectOpt) {
                                                    cls = 'border-red-300 bg-red-50'
                                                    lblCls = 'bg-red-500 text-white'
                                                    txtCls = 'text-red-700'
                                                    icon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                }
                                                return (
                                                    <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-default ${cls}`}>
                                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold ${lblCls}`}>{label}</span>
                                                        <span className={`flex-1 text-[14px] font-medium ${txtCls}`}>{opt}</span>
                                                        {icon}
                                                        {isUserChoice && <span className="text-[11px] font-semibold text-neutral-400">Your answer</span>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {/* Prev / Next */}
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
                                            <button onClick={() => dispatch({ type: 'quiz/setCurrentQuestion', payload: currentQuestion - 1 })}
                                                disabled={currentQuestion === 0}
                                                className={`flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors ${currentQuestion === 0 ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-600 hover:bg-neutral-100'}`}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                                                Previous
                                            </button>
                                            <span className="text-[12px] text-neutral-400">{prevAnswer?.is_correct ? '✅ Correct' : '❌ Incorrect'}</span>
                                            <button onClick={() => dispatch({ type: 'quiz/setCurrentQuestion', payload: currentQuestion + 1 })}
                                                disabled={currentQuestion >= currentQuiz.questions.length - 1}
                                                className={`flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors ${currentQuestion >= currentQuiz.questions.length - 1 ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-600 hover:bg-neutral-100'}`}>
                                                Next
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Right: Same Rewards Sidebar */}
                            {levelSystem && (
                                <RewardsSidebar
                                    currentLevel={reviewLevel}
                                    levelScores={reviewLevelScores}
                                    earnedBadges={reviewEarnedBadges}
                                    recentBadge={null}
                                    totalQuestions={currentQuiz.questions.length}
                                    levelSystem={levelSystem}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </LayoutGroup>
        )
    }



    // ─── Final Results (popup overlay) ───────────────────────────
    const resultsPopup = quizComplete ? (
        <GamifiedFinalResults
            score={score}
            totalQuestions={currentQuiz.questions.length}
            quizTitle={currentQuiz.title}
            courseTitle={currentQuiz.title}
            quizId={parseInt(id)}
            passingScore={currentQuiz.passing_score}
            earnedBadges={earnedBadges}
            onRestart={handleRestart}
        />
    ) : null

    // ─── Active Quiz ──────────────────────────────────────────────
    const question = currentQuiz.questions?.[currentQuestion]
    const gameQ = question ? buildGameQuestion(question, currentQuestion) : null
    const currentLevel = levelSystem && question ? getCurrentLevel(currentQuestion, levelSystem) : 1
    const levelData = levelSystem?.[`level${currentLevel}`]
    const questionsInLevel = levelData && question ? currentQuestion - levelData.startIndex + 1 : currentQuestion + 1
    const totalInLevel = levelData?.totalQuestions || currentQuiz.questions.length

    // If question is out of bounds, auto-complete the quiz
    if (!question && !quizComplete) {
        return <LoadingSpinner message="Finishing quiz..." />
    }

    return (
        <LayoutGroup>
            <div className="min-h-screen bg-neutral-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

                {/* Header bar */}
                <div className="bg-white border-b border-neutral-200">
                    <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate(-1)}
                                className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-900 text-[13px] font-medium transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                Back
                            </button>
                            <span className="w-px h-5 bg-neutral-200" />
                            <span className="text-[13px] text-neutral-900 font-semibold truncate max-w-[300px]">{currentQuiz.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[12px] text-neutral-400 font-medium">
                                Question {currentQuestion + 1} of {currentQuiz.questions.length}
                            </span>
                            <div className="w-32 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                <div className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                                    style={{ width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two column: Quiz + Sidebar */}
                <div className="max-w-[1400px] mx-auto px-4 py-8">
                    <div className="flex gap-6 items-start">
                        {/* Left: Question */}
                        <div className="flex-1 min-w-0">
                            <AnimatePresence mode="wait">
                                {gameQ && (
                                <QuizCard
                                    key={currentQuestion}
                                    question={gameQ.question}
                                    options={gameQ.options}
                                    difficulty={gameQ.difficulty}
                                    onAnswer={handleAnswer}
                                    currentQuestion={questionsInLevel}
                                    totalQuestions={totalInLevel}
                                    currentLevel={currentLevel}
                                />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right: Rewards Sidebar */}
                        {levelSystem && (
                            <RewardsSidebar
                                currentLevel={currentLevel}
                                levelScores={levelScores}
                                earnedBadges={earnedBadges}
                                recentBadge={recentBadge}
                                totalQuestions={currentQuiz.questions.length}
                                levelSystem={levelSystem}
                            />
                        )}
                    </div>
                </div>

                {/* Result popup overlay */}
                {showResultPopup && (
                    <ResultPopup
                        isCorrect={lastAnswerCorrect}
                        correctAnswerText={lastCorrectText}
                        onNext={handleNext}
                    />
                )}

                {/* Level unlock animation overlay */}
                <AnimatePresence>
                    {showLevelUnlock && unlockedLevel && (
                        <LevelUnlockAnimation
                            level={unlockedLevel}
                            onContinue={handleLevelUnlockContinue}
                        />
                    )}
                </AnimatePresence>
            </div>
            {resultsPopup}
        </LayoutGroup>
    )
}

export default Quiz
