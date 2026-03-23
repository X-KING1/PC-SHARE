import { motion, AnimatePresence } from 'framer-motion';

const ResultPopup = ({ isCorrect, correctAnswerText, onNext }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}
                onClick={onNext}
            >
                <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', duration: 0.5, bounce: 0.4 }}
                    style={{
                        background: 'white', borderRadius: '28px',
                        padding: '52px 70px', textAlign: 'center',
                        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.35)', maxWidth: '460px', width: '90%'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isCorrect ? (
                        <>
                            {/* CSS Medal for correct */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.1, type: 'spring', bounce: 0.6 }}
                                style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}
                            >
                                <div style={{
                                    width: '96px', height: '96px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 40%, #d4af37 100%)',
                                    boxShadow: '0 8px 30px rgba(255,215,0,0.5), inset 0 -4px 10px rgba(0,0,0,0.15), inset 0 4px 10px rgba(255,255,255,0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                                }}>
                                    <div style={{
                                        width: '44px', height: '44px',
                                        background: '#fff8dc',
                                        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                                    }} />
                                </div>
                            </motion.div>
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                style={{ fontSize: '32px', color: '#10b981', marginBottom: '8px', fontWeight: '800' }}
                            >
                                Correct! 🎉
                            </motion.h2>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.35 }}
                                style={{ fontSize: '16px', color: '#64748b', marginBottom: '28px' }}
                            >
                                Great job! Keep it up!
                            </motion.p>
                        </>
                    ) : (
                        <>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: 'spring' }}
                                style={{
                                    width: 90, height: 90, margin: '0 auto 20px',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '44px',
                                    boxShadow: '0 8px 24px rgba(239,68,68,0.4)'
                                }}
                            >
                                ✗
                            </motion.div>
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                style={{ fontSize: '32px', color: '#ef4444', marginBottom: '8px', fontWeight: '800' }}
                            >
                                Incorrect
                            </motion.h2>
                            {correctAnswerText && (
                                <motion.p
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.35 }}
                                    style={{ fontSize: '14px', color: '#475569', marginBottom: '8px', background: '#f1f5f9', padding: '10px 16px', borderRadius: '10px' }}
                                >
                                    Correct answer: <strong style={{ color: '#10b981' }}>{correctAnswerText}</strong>
                                </motion.p>
                            )}
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                style={{ fontSize: '16px', color: '#64748b', marginBottom: '28px' }}
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
                            padding: '14px 44px', fontSize: '16px',
                            background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                            color: 'white', border: 'none', borderRadius: '12px',
                            cursor: 'pointer', fontWeight: '700',
                            boxShadow: '0 8px 24px rgba(124,58,237,0.4)'
                        }}
                    >
                        Next Question →
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ResultPopup;
