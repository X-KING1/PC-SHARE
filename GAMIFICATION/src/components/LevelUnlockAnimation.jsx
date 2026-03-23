import { motion } from 'framer-motion';

const LevelUnlockAnimation = ({ level, onContinue }) => {

  return (
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
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '28px',
          padding: '50px 70px 60px',
          textAlign: 'center',
          maxWidth: '540px',
          boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Frosted Glass Background Effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.8), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        {/* Premium Ribbon Split Reveal */}
        <div style={{ position: 'relative', height: '280px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          
          {/* Subtle Background Glow */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.15 }}
            transition={{ delay: 0.3, duration: 1.2 }}
            style={{
              position: 'absolute',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${level.badge.color}, transparent 70%)`,
              filter: 'blur(50px)',
              zIndex: 1
            }}
          />

          {/* FULL RIBBON BAND (unity before split) */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: '320px',
              height: '70px',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, #dc2626 0%, #f97316 30%, #facc15 50%, #3b82f6 70%, #2563eb 100%)',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.5)',
              transformOrigin: 'center',
              zIndex: 10
            }}
          />

          {/* LEFT RIBBON HALF – slides out */}
          <motion.div
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: -180, opacity: 0.3 }}
            transition={{ delay: 0.5, duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
            style={{
              position: 'absolute',
              width: '160px',
              height: '70px',
              left: '50%',
              transform: 'translateX(-100%)',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              borderRadius: '9999px 0 0 9999px',
              boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4), inset 4px 0 8px rgba(255,255,255,0.15)',
              zIndex: 11
            }}
          >
            {/* Silk Glow */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '20px',
              width: '40%',
              height: '30px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.3), transparent)',
              borderRadius: '9999px',
              filter: 'blur(6px)'
            }} />
          </motion.div>

          {/* RIGHT RIBBON HALF – slides out */}
          <motion.div
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: 180, opacity: 0.3 }}
            transition={{ delay: 0.5, duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
            style={{
              position: 'absolute',
              width: '160px',
              height: '70px',
              left: '50%',
              transform: 'translateX(0)',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              borderRadius: '0 9999px 9999px 0',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4), inset -4px 0 8px rgba(255,255,255,0.15)',
              zIndex: 11
            }}
          >
            {/* Silk Glow */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              width: '40%',
              height: '30px',
              background: 'linear-gradient(270deg, rgba(255,255,255,0.3), transparent)',
              borderRadius: '9999px',
              filter: 'blur(6px)'
            }} />
          </motion.div>

          {/* Premium Medal Center - Hero Element with Shared Layout */}
          <motion.div
            layoutId={`badge-${level.id}`}
            initial={{ scale: 0.4, rotate: -180, opacity: 0, y: 30 }}
            animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ 
              layout: { duration: 0.8, ease: 'easeInOut' },
              default: { delay: 0.7, duration: 0.8, type: 'spring', bounce: 0.45 }
            }}
            style={{ 
              position: 'relative', 
              zIndex: 15,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))'
            }}
          >
            {/* Metallic Medal with Realistic Depth */}
            <motion.div
              animate={{ 
                rotate: [0, 3, -3, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                position: 'relative',
                background: level.badge.type === 'gold' 
                  ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 25%, #d4af37 50%, #ffed4e 75%, #ffd700 100%)'
                  : level.badge.type === 'silver'
                  ? 'linear-gradient(135deg, #e8e8e8 0%, #ffffff 25%, #c0c0c0 50%, #ffffff 75%, #e8e8e8 100%)'
                  : 'linear-gradient(135deg, #cd7f32 0%, #e8a87c 25%, #a0522d 50%, #e8a87c 75%, #cd7f32 100%)',
                boxShadow: `
                  0 25px 60px rgba(0,0,0,0.4),
                  inset 0 -12px 24px rgba(0,0,0,0.3),
                  inset 0 12px 24px rgba(255,255,255,0.4),
                  inset 0 0 0 8px ${level.badge.color}dd,
                  inset 0 0 0 12px ${level.badge.color}44
                `
              }}
            >
              {/* Outer Rim */}
              <div style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${level.badge.color}aa, ${level.badge.color}ee)`,
                zIndex: -1,
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)'
              }} />

              {/* Inner Ring */}
              <div style={{
                position: 'absolute',
                inset: '16px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)'
              }} />

              {/* Shine Sweep Animation - Fixed */}
              <motion.div
                initial={{ x: -220, opacity: 0 }}
                animate={{ x: 220, opacity: [0, 1, 0] }}
                transition={{ delay: 0.9, duration: 0.9, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  left: '50%',
                  width: '60px',
                  height: '260px',
                  transform: 'translateX(-50%) rotate(25deg)',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
                  pointerEvents: 'none',
                  zIndex: 5
                }}
              />

              {/* Gloss Reflection */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '20px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.5), transparent)',
                filter: 'blur(12px)'
              }} />

              {/* Center Icon - NO EMOJI */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.1, type: 'spring', bounce: 0.6 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                {/* Star Shape - Pure CSS */}
                <div style={{
                  width: '70px',
                  height: '70px',
                  background: level.badge.type === 'gold' ? '#fff8dc' : level.badge.type === 'silver' ? '#f8f9fa' : '#fff5e6',
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                  boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.5)'
                }} />
              </motion.div>

              {/* Small Sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    delay: 1.3 + i * 0.1,
                    duration: 0.8,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  style={{
                    position: 'absolute',
                    width: '4px',
                    height: '4px',
                    background: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                    top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 70}px`,
                    left: `${100 + Math.cos(i * 60 * Math.PI / 180) * 70}px`
                  }}
                />
              ))}
            </motion.div>
            
            {/* Silk Ribbon Tails with Glow */}
            <div style={{ 
              display: 'flex', 
              gap: '14px', 
              marginTop: '-16px', 
              position: 'relative', 
              zIndex: 10,
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
            }}>
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 0.95, duration: 0.5, ease: 'easeOut' }}
                style={{
                  width: '36px',
                  height: '90px',
                  background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 60%, #991b1b 100%)',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  transformOrigin: 'top',
                  boxShadow: `
                    0 6px 16px rgba(220, 38, 38, 0.5),
                    inset 4px 0 8px rgba(255,255,255,0.2),
                    inset -4px 0 8px rgba(0,0,0,0.2)
                  `,
                  position: 'relative'
                }}
              >
                {/* Silk Glow */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '25%',
                  width: '30%',
                  height: '60%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent)',
                  filter: 'blur(4px)'
                }} />
              </motion.div>
              
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 0.95, duration: 0.5, ease: 'easeOut' }}
                style={{
                  width: '36px',
                  height: '90px',
                  background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 60%, #1e40af 100%)',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  transformOrigin: 'top',
                  boxShadow: `
                    0 6px 16px rgba(37, 99, 235, 0.5),
                    inset 4px 0 8px rgba(255,255,255,0.2),
                    inset -4px 0 8px rgba(0,0,0,0.2)
                  `,
                  position: 'relative'
                }}
              >
                {/* Silk Glow */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '25%',
                  width: '30%',
                  height: '60%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent)',
                  filter: 'blur(4px)'
                }} />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Badge Title - Premium Typography */}
        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          style={{
            fontSize: '34px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '12px',
            textShadow: '0 2px 8px rgba(0,0,0,0.08)',
            letterSpacing: '-0.5px',
            position: 'relative',
            zIndex: 1
          }}
        >
          {level.badge.title}
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            fontSize: '17px',
            color: '#64748b',
            marginBottom: '32px',
            fontWeight: '500',
            position: 'relative',
            zIndex: 1
          }}
        >
          {level.badge.subtitle}
        </motion.p>

        {/* Unlock Message - Pill Badge */}
        {level.unlockMessage && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 1.7, type: 'spring', bounce: 0.5 }}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '50px',
              marginBottom: '32px',
              fontWeight: '600',
              fontSize: '15px',
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
              display: 'inline-block',
              position: 'relative',
              zIndex: 1
            }}
          >
            🔓 {level.unlockMessage}
          </motion.div>
        )}

        {/* Continue Button - Premium */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.9 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          style={{
            padding: '16px 56px',
            fontSize: '17px',
            background: `linear-gradient(135deg, ${level.badge.color}ee, ${level.badge.color})`,
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: `0 12px 35px ${level.badge.color}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
            position: 'relative',
            zIndex: 1,
            letterSpacing: '0.3px'
          }}
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default LevelUnlockAnimation;
