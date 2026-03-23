import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { goldMedalBadge, silverMedalBadge, bronzeMedalBadge, rankMedalBadge } from '../animations/medalBadges';

const BadgeScroll = ({ currentScore, totalQuestions }) => {
  const badges = [
    { animation: goldMedalBadge, label: 'Champion', color: '#FFD700', requirement: '90%+' },
    { animation: silverMedalBadge, label: 'Top 10%', color: '#C0C0C0', requirement: '70%+' },
    { animation: bronzeMedalBadge, label: 'Top 50%', color: '#CD7F32', requirement: '50%+' },
    { animation: rankMedalBadge, label: 'Participant', color: '#667eea', requirement: 'All' }
  ];

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        marginBottom: '20px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '15px'
      }}>
        <h3 style={{ fontSize: '18px', color: '#1f2937', fontWeight: 'bold' }}>
          🏆 Achievement Badges
        </h3>
        <span style={{ 
          fontSize: '16px', 
          color: '#667eea', 
          fontWeight: 'bold',
          background: '#f3f4f6',
          padding: '6px 16px',
          borderRadius: '20px'
        }}>
          Score: {currentScore}/{totalQuestions}
        </span>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        overflowX: 'auto',
        paddingBottom: '10px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#667eea #f3f4f6'
      }}>
        {badges.map((badge, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1 * index, type: 'spring' }}
            whileHover={{ scale: 1.1, y: -5 }}
            style={{
              minWidth: '140px',
              textAlign: 'center',
              padding: '15px',
              background: 'white',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, -5, 5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Lottie
                animationData={badge.animation}
                loop={false}
                style={{ width: 80, height: 100, margin: '0 auto' }}
              />
            </motion.div>
            
            <p style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              color: badge.color,
              marginTop: '8px',
              marginBottom: '4px'
            }}>
              {badge.label}
            </p>
            
            <p style={{ 
              fontSize: '11px', 
              color: '#6b7280',
              background: '#f9fafb',
              padding: '4px 8px',
              borderRadius: '8px'
            }}>
              {badge.requirement}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BadgeScroll;
