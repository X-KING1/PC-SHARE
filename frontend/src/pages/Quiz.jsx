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
    const { currentQuiz, currentAttempt, currentQuestion, answers, score, status } = useSelector((state) => state.quiz)
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

    if (!currentAttempt && !quizComplete) {
        return <LoadingSpinner message="Starting quiz..." />
    }

    // ─── Final Results ────────────────────────────────────────────
    if (quizComplete) {
        return (
            <GamifiedFinalResults
                score={score}
                totalQuestions={currentQuiz.questions.length}
                quizTitle={currentQuiz.title}
                passingScore={currentQuiz.passing_score}
                earnedBadges={earnedBadges}
                onRestart={handleRestart}
            />
        )
    }

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
        </LayoutGroup>
    )
}

export default Quiz
