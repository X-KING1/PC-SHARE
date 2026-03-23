import { motion } from 'framer-motion';
import { levelSystem } from '../data/levelSystem';

const LevelProgress = ({ currentLevel, currentScore, totalInLevel }) => {
  const level = levelSystem[`level${currentLevel}`];
  
  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
            Level {currentLevel}: {level.name}
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            {totalInLevel} Questions • Pass: {level.passingScore}+
          </p>
        </div>
        <div style={{
          background: level.badge.color,
          color: 'white',
          padding: '8px 20px',
          borderRadius: '20px',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          {currentScore}/{totalInLevel}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        background: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentScore / totalInLevel) * 100}%` }}
          transition={{ duration: 0.5 }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${level.badge.color}, ${level.badge.color}dd)`,
            borderRadius: '4px'
          }}
        />
      </div>
    </motion.div>
  );
};

export default LevelProgress;
