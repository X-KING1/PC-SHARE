import { useState } from 'react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import QuizCard from './components/QuizCard';
import ResultPopup from './components/ResultPopup';
import FinalResults from './components/FinalResults';
import RewardsSidebar from './components/RewardsSidebar';
import LevelUnlockAnimation from './components/LevelUnlockAnimation';
import { quizQuestions } from './data/quizData';
import { levelSystem, getCurrentLevel } from './data/levelSystem';
import { triggerSuccessConfetti, triggerConfetti } from './animations/confetti';

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [levelScores, setLevelScores] = useState({ 1: 0, 2: 0, 3: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showLevelUnlock, setShowLevelUnlock] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [recentBadge, setRecentBadge] = useState(null);

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const handleAnswer = async (selectedAnswer) => {
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      
      const currentLevel = getCurrentLevel(currentQuestionIndex);
      setLevelScores(prev => ({
        ...prev,
        [currentLevel]: prev[currentLevel] + 1
      }));
      
      triggerSuccessConfetti();
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const handleNext = () => {
    const currentLevel = getCurrentLevel(currentQuestionIndex);
    const levelData = levelSystem[`level${currentLevel}`];
    
    // Check if this was the LAST question of the level
    if (currentQuestionIndex === levelData.endIndex) {
      const levelScore = levelScores[currentLevel];
      
      console.log('Level Complete!', { level: currentLevel, score: levelScore, passing: levelData.passingScore });
      
      // Always show level unlock if passed
      if (levelScore >= levelData.passingScore) {
        setShowResult(false);
        setUnlockedLevel(levelData);
        setRecentBadge(levelData);
        setEarnedBadges(prev => [...prev, levelData]);
        setShowLevelUnlock(true);
        triggerConfetti();
        return;
      }
    }
    
    setShowResult(false);
    
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const handleLevelUnlockContinue = () => {
    setShowLevelUnlock(false);
    
    // Clear recent badge after animation completes
    setTimeout(() => setRecentBadge(null), 800);
    
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizComplete(false);
    setShowResult(false);
  };

  if (quizComplete) {
    return (
      <FinalResults
        score={score}
        totalQuestions={quizQuestions.length}
        onRestart={handleRestart}
      />
    );
  }

  const currentLevel = getCurrentLevel(currentQuestionIndex);
  const levelData = levelSystem[`level${currentLevel}`];
  const questionsInLevel = currentQuestionIndex - levelData.startIndex + 1;

  return (
    <LayoutGroup>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 380px',
        gap: '24px',
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto',
        minHeight: '100vh'
      }}>
        {/* Left Column - MCQ Area (70%) */}
        <div style={{ minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <QuizCard
              key={currentQuestionIndex}
              question={currentQuestion.question}
              options={currentQuestion.options}
              difficulty={currentQuestion.difficulty}
              onAnswer={handleAnswer}
              currentQuestion={questionsInLevel}
              totalQuestions={levelData.totalQuestions}
              currentLevel={currentLevel}
            />
          </AnimatePresence>
        </div>

        {/* Right Column - Rewards Sidebar (30%) */}
        <RewardsSidebar
          currentLevel={currentLevel}
          levelScores={levelScores}
          earnedBadges={earnedBadges}
          recentBadge={recentBadge}
          totalQuestions={quizQuestions.length}
        />

        {showResult && (
          <ResultPopup
            isCorrect={isCorrect}
            onNext={handleNext}
          />
        )}

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
  );
}

export default App;
