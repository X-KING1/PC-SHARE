import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { triggerConfetti } from '../../animations/confetti';
import { useNavigate } from 'react-router-dom';

const GamifiedFinalResults = ({ score, totalQuestions, quizTitle, quizId, passingScore, earnedBadges, onRestart, courseTitle, instructorName }) => {
    const navigate = useNavigate();
    const badgeCount = earnedBadges?.length || 0;
    const passed = badgeCount >= 3;
    const percentage = totalQuestions > 0 ? Math.round((score / (totalQuestions * 10)) * 100) : 0;

    // Detect quiz difficulty from title
    const titleLower = (quizTitle || '').toLowerCase();
    const isEasy = titleLower.includes('easy');
    const isMedium = titleLower.includes('medium');
    const isHard = titleLower.includes('hard');
    // Next quiz ID: Easy→Medium (+1), Medium→Hard (+1)
    const nextQuizId = quizId ? quizId + 1 : null;

    useEffect(() => {
        if (passed) triggerConfetti();
    }, [passed]);

    const getRank = () => {
        if (badgeCount >= 3) return { label: '🏆 Champion', color: '#FFD700', bg: 'linear-gradient(135deg, #ffd700, #d4af37)' };
        if (badgeCount === 2) return { label: '🥈 Top Performer', color: '#C0C0C0', bg: 'linear-gradient(135deg, #e8e8e8, #c0c0c0)' };
        if (badgeCount === 1) return { label: '🥉 Good Effort', color: '#CD7F32', bg: 'linear-gradient(135deg, #cd7f32, #a0522d)' };
        return { label: '💪 Keep Practicing', color: '#7c3aed', bg: 'linear-gradient(135deg, #a855f7, #7c3aed)' };
    };

    const { label, color, bg } = getRank();

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                style={{
                    background: 'white', borderRadius: '20px',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
                    width: '100%', maxWidth: '520px', maxHeight: '85vh',
                    overflowY: 'auto', padding: '36px 32px',
                    textAlign: 'center', position: 'relative',
                }}
            >
                    {/* Medal with CSS */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: 'spring', duration: 0.8, bounce: 0.5 }}
                        style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}
                    >
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '50%', background: bg,
                            boxShadow: `0 20px 50px ${color}55, inset 0 -8px 20px rgba(0,0,0,0.2), inset 0 8px 20px rgba(255,255,255,0.35)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', background: `linear-gradient(135deg, ${color}88, ${color}cc)`, zIndex: -1 }} />
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{
                                    width: '70px', height: '70px',
                                    background: percentage >= 70 ? '#fff8dc' : '#fff5e6',
                                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))'
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Rank badge */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.55, type: 'spring' }}
                        style={{ display: 'inline-block', padding: '8px 24px', background: bg, borderRadius: '20px', color: percentage >= 70 ? '#1e293b' : 'white', fontWeight: '700', fontSize: '17px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.18)' }}
                    >
                        {label}
                    </motion.div>

                    {/* Quiz title */}
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{ fontSize: '32px', marginBottom: '8px', color: '#1e293b', fontWeight: '800' }}
                    >
                        Quiz Complete! 🎉
                    </motion.h1>
                    {quizTitle && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                            style={{ color: '#64748b', marginBottom: '20px', fontSize: '15px' }}
                        >
                            {quizTitle}
                        </motion.p>
                    )}

                    {/* Big Score */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7, type: 'spring' }}
                        style={{
                            fontSize: '72px', fontWeight: '800',
                            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            marginBottom: '8px', lineHeight: 1
                        }}
                    >
                        {score} pts
                    </motion.div>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        style={{ fontSize: '22px', color: '#64748b', marginBottom: '12px' }}
                    >
                        {badgeCount >= 3 ? '🌟 Outstanding! All levels mastered!' :
                            badgeCount === 2 ? '👏 Great job! 2 levels cleared!' :
                                badgeCount === 1 ? '👍 Good effort, keep going!' :
                                    '💪 Review the material and try again!'}
                    </motion.p>

                    {/* Pass/Fail badge */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.0, type: 'spring' }}
                        style={{
                            display: 'inline-block', padding: '8px 24px', borderRadius: '20px', fontWeight: '700', fontSize: '15px', marginBottom: '28px',
                            background: passed ? '#ecfdf5' : '#fef2f2', color: passed ? '#10b981' : '#ef4444',
                            border: `2px solid ${passed ? '#10b981' : '#ef4444'}33`
                        }}
                    >
                        {passed ? '✅ All Levels Complete' : `❌ ${badgeCount}/3 Levels Cleared`}
                    </motion.div>

                    {/* Earned Badges Row */}
                    {earnedBadges && earnedBadges.length > 0 && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.1 }}
                            style={{ marginBottom: '32px' }}
                        >
                            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                                Badges Earned
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {earnedBadges.map((badge) => (
                                    <div key={badge.id} style={{
                                        width: '56px', height: '56px', borderRadius: '50%',
                                        background: badge.badge.type === 'gold' ? 'linear-gradient(135deg, #ffd700, #d4af37)' : badge.badge.type === 'silver' ? 'linear-gradient(135deg, #e8e8e8, #c0c0c0)' : 'linear-gradient(135deg, #cd7f32, #a0522d)',
                                        boxShadow: `0 4px 14px ${badge.badge.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        title: badge.name
                                    }}>
                                        <div style={{ width: '28px', height: '28px', background: '#fff8dc', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Action buttons */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
                    >
                        {/* Certificate: ONLY after Hard quiz with all levels passed */}
                        {isHard && passed && earnedBadges && earnedBadges.length >= 3 && (
                            <button
                                onClick={() => navigate('/certificate', { state: { score, percentage, quizTitle, courseTitle, instructorName, allLevelsPassed: true } })}
                                style={{
                                    padding: '14px 28px', fontSize: '15px',
                                    background: 'linear-gradient(135deg, #5624d0, #7c3aed)',
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    fontWeight: '700', cursor: 'pointer',
                                    boxShadow: '0 8px 24px rgba(86,36,208,0.35)'
                                }}
                            >
                                🏆 Get Certificate
                            </button>
                        )}
                        {/* Easy → Move to Medium */}
                        {isEasy && passed && nextQuizId && (
                            <button
                                onClick={() => navigate(`/quiz/${nextQuizId}`)}
                                style={{
                                    padding: '14px 28px', fontSize: '15px',
                                    background: 'linear-gradient(135deg, #059669, #10b981)',
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    fontWeight: '700', cursor: 'pointer',
                                    boxShadow: '0 8px 24px rgba(5,150,105,0.35)'
                                }}
                            >
                                🚀 Move to Medium Quiz
                            </button>
                        )}
                        {/* Medium → Move to Hard */}
                        {isMedium && passed && nextQuizId && (
                            <button
                                onClick={() => navigate(`/quiz/${nextQuizId}`)}
                                style={{
                                    padding: '14px 28px', fontSize: '15px',
                                    background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    fontWeight: '700', cursor: 'pointer',
                                    boxShadow: '0 8px 24px rgba(217,119,6,0.35)'
                                }}
                            >
                                🔥 Move to Hard Quiz
                            </button>
                        )}
                        {/* Progress message when not all levels passed */}
                        {!passed && (
                            <div style={{
                                padding: '12px 24px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #fef3c7, #fef9c3)',
                                border: '1px solid #fde68a',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                fontSize: '13px', color: '#92400e', fontWeight: 600,
                            }}>
                                {isHard ? '🔒 Pass all 3 levels to unlock your certificate' : `⭐ Pass all levels to move to the ${isEasy ? 'Medium' : 'Hard'} Quiz`}
                            </div>
                        )}
                        <button
                            onClick={onRestart}
                            style={{
                                padding: '14px 28px', fontSize: '15px',
                                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontWeight: '700', cursor: 'pointer',
                                boxShadow: '0 8px 24px rgba(168,85,247,0.35)'
                            }}
                        >
                            🔄 Try Again
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                padding: '14px 28px', fontSize: '15px',
                                background: 'white', color: '#1e293b',
                                border: '2px solid #e2e8f0', borderRadius: '12px',
                                fontWeight: '700', cursor: 'pointer'
                            }}
                        >
                            ← Back to Course
                        </button>
                    </motion.div>
            </motion.div>
        </div>
    );
};

export default GamifiedFinalResults;
