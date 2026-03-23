import { motion } from 'framer-motion';

const RewardsSidebar = ({ currentLevel, levelScores, earnedBadges, recentBadge, totalQuestions, levelSystem }) => {
    if (!levelSystem) return null;
    const levelData = levelSystem[`level${currentLevel}`];
    if (!levelData) return null;

    const currentScore = levelScores[currentLevel] || 0;
    const progressPercent = Math.min((currentScore / levelData.totalQuestions) * 100, 100);
    const pointsToNext = Math.max(levelData.passingScore - currentScore, 0);
    const totalScore = Object.values(levelScores).reduce((a, b) => a + b, 0);

    return (
        <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-[340px] flex-shrink-0 hidden lg:block sticky top-4"
        >
            <div className="bg-white border border-neutral-200 rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>

                {/* Current Level Info */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-[16px] font-bold text-neutral-900">
                            Level {currentLevel}
                        </h3>
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-md">
                            {levelData.name}
                        </span>
                    </div>
                    <p className="text-[12px] text-neutral-400">
                        Pass with {levelData.passingScore}+ correct answers
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <span className="text-[12px] font-semibold text-neutral-500">Progress</span>
                        <span className="text-[12px] font-bold text-neutral-900">
                            {currentScore}/{levelData.totalQuestions}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full bg-neutral-900 rounded-full relative overflow-hidden"
                        >
                            {/* Shine sweep */}
                            <motion.div
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
                                className="absolute top-0 left-0 w-1/2 h-full"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                    transform: 'skewX(-20deg)'
                                }}
                            />
                        </motion.div>
                    </div>
                    {pointsToNext > 0 && (
                        <p className="text-[11px] text-neutral-400 mt-2 text-center">
                            {pointsToNext} more correct to unlock badge
                        </p>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-neutral-100 mb-5" />

                {/* Earned Badges */}
                <div>
                    <h4 className="text-[11px] font-bold text-neutral-400 mb-3 uppercase tracking-wider">
                        Your Badges
                    </h4>
                    <div className="flex flex-col gap-2.5">
                        {earnedBadges.length === 0 ? (
                            <div className="py-5 bg-neutral-50 rounded-xl text-center border border-dashed border-neutral-200">
                                <svg className="mx-auto mb-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                                </svg>
                                <p className="text-[11px] text-neutral-400">Complete levels to earn badges</p>
                            </div>
                        ) : (
                            earnedBadges.map((badge) => (
                                <motion.div
                                    key={badge.id}
                                    layoutId={`badge-${badge.id}`}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ layout: { duration: 0.8 }, default: { type: 'spring', bounce: 0.5 } }}
                                    className={`flex items-center gap-3 px-3.5 py-3 bg-white rounded-xl border-2 transition-colors ${badge.id === recentBadge?.id
                                            ? 'border-neutral-900 shadow-[0_0_0_3px_rgba(0,0,0,0.06)]'
                                            : 'border-neutral-200'
                                        }`}
                                >
                                    {/* Medal */}
                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${badge.badge.type === 'gold'
                                            ? 'bg-neutral-900'
                                            : badge.badge.type === 'silver'
                                                ? 'bg-neutral-400'
                                                : 'bg-neutral-600'
                                        }`}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    </div>
                                    {/* Badge info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-neutral-900 truncate">
                                            Level {badge.id} — {badge.name}
                                        </p>
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                            {badge.badge.type} badge
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-neutral-100 my-5" />

                {/* Total Score */}
                <div className="bg-neutral-50 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">
                        Total Score
                    </p>
                    <p className="text-[28px] font-black text-neutral-900 leading-none">
                        {totalScore}
                        <span className="text-[14px] font-normal text-neutral-400">/{totalQuestions}</span>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default RewardsSidebar;
