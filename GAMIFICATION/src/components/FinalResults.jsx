import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useEffect } from 'react';
import { triggerConfetti } from '../animations/confetti';
import { goldMedalBadge, silverMedalBadge, bronzeMedalBadge, rankMedalBadge } from '../animations/medalBadges';

const FinalResults = ({ score, totalQuestions, onRestart }) => {
  const percentage = (score / totalQuestions) * 100;

  useEffect(() => {
    if (percentage >= 70) {
      triggerConfetti();
    }
  }, [percentage]);

  // Select medal based on performance
  const getMedalBadge = () => {
    if (percentage >= 90) return { badge: goldMedalBadge, rank: '🏆 Champion', color: '#FFD700' };
    if (percentage >= 70) return { badge: silverMedalBadge, rank: '🥈 Top 10%', color: '#C0C0C0' };
    if (percentage >= 50) return { badge: bronzeMedalBadge, rank: '🥉 Top 50%', color: '#CD7F32' };
    return { badge: rankMedalBadge, rank: '🎯 Participant', color: '#667eea' };
  };

  const { badge, rank, color } = getMedalBadge();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '60px 40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: 'spring', duration: 0.8 }}
      >
        <Lottie
          animationData={badge}
          loop={false}
          style={{ width: 200, height: 240, margin: '0 auto' }}
        />
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        style={{
          display: 'inline-block',
          padding: '8px 24px',
          background: color,
          borderRadius: '20px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px',
          marginBottom: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
      >
        {rank}
      </motion.div>

      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ fontSize: '48px', marginBottom: '20px', color: '#1f2937' }}
      >
        Quiz Complete! 🎉
      </motion.h1>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: 'spring' }}
        style={{
          fontSize: '72px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}
      >
        {score}/{totalQuestions}
      </motion.div>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{ fontSize: '24px', color: '#6b7280', marginBottom: '40px' }}
      >
        {percentage >= 90 ? '🏆 Outstanding!' : 
         percentage >= 70 ? '🌟 Great Job!' : 
         percentage >= 50 ? '👍 Good Effort!' : 
         '💪 Keep Practicing!'}
      </motion.p>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRestart}
        style={{
          padding: '16px 48px',
          fontSize: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
        }}
      >
        Try Again
      </motion.button>
    </motion.div>
  );
};

export default FinalResults;
