import { motion } from 'framer-motion';

const QuizCard = ({ question, options, onAnswer, currentQuestion, totalQuestions, difficulty }) => {
  const difficultyColors = {
    simple: '#10b981',
    moderate: '#f59e0b',
    hard: '#ef4444'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
      transition={{ duration: 0.5, type: 'spring' }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        maxHeight: '85vh'
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          borderRadius: '4px'
        }}
      />

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#666' }}>
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span
          style={{
            fontSize: '12px',
            padding: '4px 12px',
            borderRadius: '12px',
            background: difficultyColors[difficulty],
            color: 'white',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}
        >
          {difficulty}
        </span>
      </div>

      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: '24px',
          marginBottom: '30px',
          color: '#1f2937',
          lineHeight: '1.4'
        }}
      >
        {question}
      </motion.h2>

      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto', 
        paddingRight: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {options.map((option, index) => (
          <motion.button
            key={index}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswer(index)}
            style={{
              padding: '16px 20px',
              fontSize: '16px',
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              color: '#374151',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.background = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.background = 'white';
            }}
          >
            <span style={{ 
              fontWeight: 'bold', 
              marginRight: '12px', 
              color: '#667eea',
              fontSize: '18px',
              minWidth: '30px'
            }}>
              {String.fromCharCode(65 + index)}.
            </span>
            <span style={{ flex: 1 }}>{option}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuizCard;
