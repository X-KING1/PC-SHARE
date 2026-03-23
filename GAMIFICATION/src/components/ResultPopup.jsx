import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { goldMedalBadge } from '../animations/medalBadges';

const ResultPopup = ({ isCorrect, onNext }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={onNext}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', duration: 0.6 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '60px 80px',
            textAlign: 'center',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
            maxWidth: '500px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isCorrect ? (
            <>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', duration: 0.8 }}
                style={{ marginBottom: '20px' }}
              >
                <Lottie
                  animationData={goldMedalBadge}
                  loop={false}
                  style={{ width: 150, height: 180, margin: '0 auto' }}
                />
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: '36px', color: '#10b981', marginBottom: '10px' }}
              >
                Correct! 🎉
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ fontSize: '18px', color: '#6b7280', marginBottom: '30px' }}
              >
                Great job! Keep it up!
              </motion.p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                style={{
                  width: 120,
                  height: 120,
                  margin: '0 auto 20px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '60px'
                }}
              >
                ❌
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: '36px', color: '#ef4444', marginBottom: '10px' }}
              >
                Incorrect
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ fontSize: '18px', color: '#6b7280', marginBottom: '30px' }}
              >
                Don't worry, keep learning!
              </motion.p>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            style={{
              padding: '14px 40px',
              fontSize: '18px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Next Question
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResultPopup;
