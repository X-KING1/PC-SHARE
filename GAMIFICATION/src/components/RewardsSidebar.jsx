import { motion } from 'framer-motion';
import { levelSystem } from '../data/levelSystem';

const RewardsSidebar = ({ currentLevel, levelScores, earnedBadges, recentBadge, totalQuestions }) => {
  const levelData = levelSystem[`level${currentLevel}`];
  const currentScore = levelScores[currentLevel];
  const progressPercent = (currentScore / levelData.totalQuestions) * 100;
  const pointsToNext = levelData.passingScore - currentScore;

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'sticky',
        top: '20px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '20px',
        padding: '28px 24px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(0,0,0,0.06)',
        height: 'fit-content'
      }}
    >
      {/* Current Level Info */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#1e293b',
            margin: 0
          }}>
            Level {currentLevel}
          </h3>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: levelData.badge.color,
            background: `${levelData.badge.color}15`,
            padding: '4px 12px',
            borderRadius: '12px'
          }}>
            {levelData.name}
          </span>
        </div>
        
        <p style={{ 
          fontSize: '13px', 
          color: '#64748b',
          margin: 0
        }}>
          Pass with {levelData.passingScore}+ correct
        </p>
      </div>

      {/* Redeemable Points Progress */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#475569'
          }}>
            Progress
          </span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '700', 
            color: levelData.badge.color
          }}>
            {currentScore}/{levelData.totalQuestions}
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div style={{
          width: '100%',
          height: '12px',
          background: '#e2e8f0',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${levelData.badge.color}dd, ${levelData.badge.color})`,
              borderRadius: '9999px',
              boxShadow: `0 0 12px ${levelData.badge.color}60`,
              position: 'relative'
            }}
          >
            {/* Shine Effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: 'easeInOut'
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                transform: 'skewX(-20deg)'
              }}
            />
          </motion.div>
        </div>

        {/* Points to Next Badge */}
        {pointsToNext > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              fontSize: '12px', 
              color: '#64748b',
              marginTop: '8px',
              textAlign: 'center',
              fontWeight: '500'
            }}
          >
            {pointsToNext} more correct to unlock badge
          </motion.p>
        )}
      </div>

      {/* Earned Badges */}
      <div>
        <h4 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#475569',
          marginBottom: '14px'
        }}>
          Your Badges
        </h4>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '10px'
        }}>
          {earnedBadges.length === 0 ? (
            <div style={{
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '12px',
              textAlign: 'center',
              border: '2px dashed #cbd5e1'
            }}>
              <p style={{ 
                fontSize: '13px', 
                color: '#94a3b8',
                margin: 0
              }}>
                Complete levels to earn badges
              </p>
            </div>
          ) : (
            earnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                layoutId={`badge-${badge.id}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  layout: { duration: 0.8, ease: 'easeInOut' },
                  default: { type: 'spring', bounce: 0.5 }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  background: 'white',
                  borderRadius: '14px',
                  border: badge.id === recentBadge?.id 
                    ? '2px solid rgba(251, 191, 36, 0.6)'
                    : `2px solid ${badge.badge.color}30`,
                  boxShadow: badge.id === recentBadge?.id
                    ? '0 0 0 4px rgba(251, 191, 36, 0.2), 0 4px 12px rgba(251, 191, 36, 0.3)'
                    : `0 4px 12px ${badge.badge.color}20`
                }}
              >
                {/* Mini Medal - Shared Element */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: badge.badge.type === 'gold' 
                    ? 'linear-gradient(135deg, #ffd700, #d4af37)'
                    : badge.badge.type === 'silver'
                    ? 'linear-gradient(135deg, #e8e8e8, #c0c0c0)'
                    : 'linear-gradient(135deg, #cd7f32, #a0522d)',
                  boxShadow: `0 4px 12px ${badge.badge.color}40, inset 0 -2px 6px rgba(0,0,0,0.2), inset 0 2px 6px rgba(255,255,255,0.3)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  position: 'relative'
                }}>
                  {/* Star */}
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: badge.badge.type === 'gold' ? '#fff8dc' : badge.badge.type === 'silver' ? '#f8f9fa' : '#fff5e6',
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }} />
                </div>

                {/* Badge Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1e293b',
                    margin: 0,
                    marginBottom: '2px'
                  }}>
                    Level {badge.id}
                  </p>
                  <p style={{ 
                    fontSize: '11px', 
                    color: '#64748b',
                    margin: 0
                  }}>
                    {badge.name}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Total Score */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p style={{ 
          fontSize: '12px', 
          color: '#64748b',
          margin: 0,
          marginBottom: '4px'
        }}>
          Total Score
        </p>
        <p style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#1e293b',
          margin: 0
        }}>
          {Object.values(levelScores).reduce((a, b) => a + b, 0)}/{totalQuestions}
        </p>
      </div>
    </motion.div>
  );
};

export default RewardsSidebar;
