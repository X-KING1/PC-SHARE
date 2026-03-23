export const levelSystem = {
  level1: {
    id: 1,
    name: 'Beginner Mastery',
    totalQuestions: 8,
    startIndex: 0,
    endIndex: 7,
    passingScore: 5,
    badge: {
      type: 'bronze',
      title: 'Beginner Mastery Badge',
      subtitle: 'Foundation Level Complete',
      color: '#CD7F32'
    },
    unlockMessage: 'Level 2 Unlocked — 10 MCQs'
  },
  level2: {
    id: 2,
    name: 'Intermediate Mastery',
    totalQuestions: 10,
    startIndex: 8,
    endIndex: 17,
    passingScore: 5,
    badge: {
      type: 'silver',
      title: 'Silver Merit Ribbon Badge',
      subtitle: 'Intermediate Level Complete',
      color: '#C0C0C0'
    },
    unlockMessage: 'Level 3 Unlocked — 7 MCQs'
  },
  level3: {
    id: 3,
    name: 'Advanced Mastery',
    totalQuestions: 7,
    startIndex: 18,
    endIndex: 24,
    passingScore: 4,
    badge: {
      type: 'gold',
      title: 'Gold Merit Ribbon Medal',
      subtitle: 'Advanced Level — Mastery Achieved',
      color: '#FFD700'
    },
    unlockMessage: 'Skill Unlocked: Complete Mastery'
  }
};

export const getLevelByQuestionIndex = (index) => {
  if (index <= 7) return levelSystem.level1;
  if (index <= 17) return levelSystem.level2;
  return levelSystem.level3;
};

export const getCurrentLevel = (questionIndex) => {
  if (questionIndex <= 7) return 1;
  if (questionIndex <= 17) return 2;
  return 3;
};
