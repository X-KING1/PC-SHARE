/**
 * Dynamic Level System
 * Splits quiz questions into 3 equal levels: Basic → Intermediate → Advanced
 * Each level has ~1/3 of total questions
 */
export const buildLevelSystem = (questions) => {
    const total = questions.length;

    // Split into 3 equal parts
    const perLevel = Math.ceil(total / 3);
    const l1End = Math.min(perLevel - 1, total - 1);
    const l2End = Math.min(perLevel * 2 - 1, total - 1);
    const l3End = total - 1;

    const l1Count = l1End + 1;
    const l2Count = l2End - l1End;
    const l3Count = l3End - l2End;

    return {
        level1: {
            id: 1,
            name: 'Basic Level',
            totalQuestions: l1Count,
            startIndex: 0,
            endIndex: l1End,
            passingScore: Math.ceil(l1Count * 0.5),   // 50% to pass
            badge: { type: 'bronze', title: 'Basic Mastery Badge', subtitle: 'Foundation Level Complete', color: '#CD7F32' },
            unlockMessage: 'Intermediate Level Unlocked!'
        },
        level2: {
            id: 2,
            name: 'Intermediate Level',
            totalQuestions: l2Count,
            startIndex: l1End + 1,
            endIndex: l2End,
            passingScore: Math.ceil(l2Count * 0.5),
            badge: { type: 'silver', title: 'Silver Merit Badge', subtitle: 'Intermediate Level Complete', color: '#C0C0C0' },
            unlockMessage: 'Advanced Level Unlocked!'
        },
        level3: {
            id: 3,
            name: 'Advanced Level',
            totalQuestions: l3Count,
            startIndex: l2End + 1,
            endIndex: l3End,
            passingScore: Math.ceil(l3Count * 0.5),
            badge: { type: 'gold', title: 'Gold Merit Medal', subtitle: 'Advanced Level — Mastery Achieved', color: '#FFD700' },
            unlockMessage: 'Complete Mastery Achieved!'
        }
    };
};

export const getCurrentLevel = (questionIndex, levelSystem) => {
    if (questionIndex <= levelSystem.level1.endIndex) return 1;
    if (questionIndex <= levelSystem.level2.endIndex) return 2;
    return 3;
};

/**
 * Get difficulty label for a question by its index
 */
export const getDifficulty = (questionIndex, levelSystem) => {
    if (questionIndex <= levelSystem.level1.endIndex) return 'easy';
    if (questionIndex <= levelSystem.level2.endIndex) return 'moderate';
    return 'hard';
};
