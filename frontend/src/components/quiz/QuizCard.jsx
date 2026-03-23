import { motion } from 'framer-motion';

const QuizCard = ({ question, options, onAnswer, currentQuestion, totalQuestions, difficulty }) => {
    const difficultyStyles = {
        simple: 'bg-neutral-100 text-neutral-600',
        moderate: 'bg-neutral-200 text-neutral-700',
        hard: 'bg-neutral-900 text-white',
        easy: 'bg-neutral-100 text-neutral-600',
        medium: 'bg-neutral-200 text-neutral-700'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-white rounded-2xl border border-neutral-200 p-8 relative overflow-hidden"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
        >
            {/* Progress bar at top */}
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute top-0 left-0 h-[3px] bg-neutral-900 rounded-r"
            />

            {/* Header: question number + difficulty */}
            <div className="mb-6 flex justify-between items-center">
                <span className="text-[13px] text-neutral-400 font-semibold">
                    Question {currentQuestion} of {totalQuestions}
                </span>
                {difficulty && (
                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${difficultyStyles[difficulty] || 'bg-neutral-100 text-neutral-600'}`}>
                        {difficulty}
                    </span>
                )}
            </div>

            {/* Question text */}
            <motion.h2
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-[20px] font-bold text-neutral-900 leading-relaxed mb-8"
            >
                {question}
            </motion.h2>

            {/* Answer options */}
            <div className="flex flex-col gap-3">
                {options.map((option, index) => (
                    <motion.button
                        key={index}
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.08 * index }}
                        whileHover={{ scale: 1.01, x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onAnswer(index)}
                        className="w-full px-5 py-4 text-[15px] bg-white border-2 border-neutral-200 rounded-xl cursor-pointer text-left flex items-center transition-colors duration-150 hover:border-neutral-900 hover:bg-neutral-50 group"
                    >
                        <span className="font-bold mr-4 text-neutral-300 text-[15px] min-w-[28px] group-hover:text-neutral-900 transition-colors">
                            {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="flex-1 text-neutral-700 group-hover:text-neutral-900 transition-colors">{option}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="text-neutral-200 group-hover:text-neutral-900 transition-colors ml-2 flex-shrink-0">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

export default QuizCard;
