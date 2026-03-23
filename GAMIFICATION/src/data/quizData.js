export const quizQuestions = [
  // SIMPLE (1-8)
  {
    id: 1,
    difficulty: 'simple',
    question: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'High Tech Modern Language',
      'Home Tool Markup Language',
      'Hyperlinks and Text Markup Language'
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    difficulty: 'simple',
    question: 'Which HTML tag is used for the largest heading?',
    options: ['<h6>', '<heading>', '<h1>', '<head>'],
    correctAnswer: 2
  },
  {
    id: 3,
    difficulty: 'simple',
    question: 'What does CSS stand for?',
    options: [
      'Creative Style Sheets',
      'Cascading Style Sheets',
      'Computer Style Sheets',
      'Colorful Style Sheets'
    ],
    correctAnswer: 1
  },
  {
    id: 4,
    difficulty: 'simple',
    question: 'Which symbol is used for comments in JavaScript?',
    options: ['<!-- -->', '//', '/* */', 'Both // and /* */'],
    correctAnswer: 3
  },
  {
    id: 5,
    difficulty: 'simple',
    question: 'What is the correct way to declare a variable in JavaScript?',
    options: ['variable x = 5;', 'let x = 5;', 'v x = 5;', 'dim x = 5;'],
    correctAnswer: 1
  },
  {
    id: 6,
    difficulty: 'simple',
    question: 'Which company developed JavaScript?',
    options: ['Microsoft', 'Netscape', 'Google', 'Mozilla'],
    correctAnswer: 1
  },
  {
    id: 7,
    difficulty: 'simple',
    question: 'What is the correct HTML element for inserting a line break?',
    options: ['<break>', '<lb>', '<br>', '<newline>'],
    correctAnswer: 2
  },
  {
    id: 8,
    difficulty: 'simple',
    question: 'Which CSS property is used to change text color?',
    options: ['text-color', 'font-color', 'color', 'text-style'],
    correctAnswer: 2
  },

  // MODERATE (9-18)
  {
    id: 9,
    difficulty: 'moderate',
    question: 'What is the purpose of the "use strict" directive in JavaScript?',
    options: [
      'Makes code run faster',
      'Enables strict mode for safer coding',
      'Compiles code to machine language',
      'Enables ES6 features'
    ],
    correctAnswer: 1
  },
  {
    id: 10,
    difficulty: 'moderate',
    question: 'Which method is used to add an element at the end of an array?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    correctAnswer: 0
  },
  {
    id: 11,
    difficulty: 'moderate',
    question: 'What is the difference between "==" and "===" in JavaScript?',
    options: [
      'No difference',
      '=== checks type and value, == only checks value',
      '== is faster than ===',
      '=== is deprecated'
    ],
    correctAnswer: 1
  },
  {
    id: 12,
    difficulty: 'moderate',
    question: 'What is a closure in JavaScript?',
    options: [
      'A way to close browser windows',
      'A function with access to its outer scope',
      'A method to end loops',
      'A CSS property'
    ],
    correctAnswer: 1
  },
  {
    id: 13,
    difficulty: 'moderate',
    question: 'Which CSS property controls the stacking order of elements?',
    options: ['stack-order', 'z-index', 'layer', 'position-order'],
    correctAnswer: 1
  },
  {
    id: 14,
    difficulty: 'moderate',
    question: 'What is the purpose of the "async" keyword in JavaScript?',
    options: [
      'Makes functions run faster',
      'Declares a function that returns a Promise',
      'Runs code in parallel',
      'Prevents callback hell'
    ],
    correctAnswer: 1
  },
  {
    id: 15,
    difficulty: 'moderate',
    question: 'Which React hook is used for side effects?',
    options: ['useState', 'useEffect', 'useContext', 'useMemo'],
    correctAnswer: 1
  },
  {
    id: 16,
    difficulty: 'moderate',
    question: 'What is the virtual DOM in React?',
    options: [
      'A copy of the real DOM kept in memory',
      'A browser API',
      'A CSS framework',
      'A database'
    ],
    correctAnswer: 0
  },
  {
    id: 17,
    difficulty: 'moderate',
    question: 'What does REST stand for in REST API?',
    options: [
      'Remote Execution State Transfer',
      'Representational State Transfer',
      'Real Estate State Transfer',
      'Responsive Execution State Transfer'
    ],
    correctAnswer: 1
  },
  {
    id: 18,
    difficulty: 'moderate',
    question: 'Which HTTP method is used to update a resource?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correctAnswer: 2
  },

  // HARD (19-30, but we'll use 19-30 for 12 questions)
  {
    id: 19,
    difficulty: 'hard',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1
  },
  {
    id: 20,
    difficulty: 'hard',
    question: 'What is event delegation in JavaScript?',
    options: [
      'Passing events between components',
      'Using event bubbling to handle events on parent elements',
      'Preventing default behavior',
      'Creating custom events'
    ],
    correctAnswer: 1
  },
  {
    id: 21,
    difficulty: 'hard',
    question: 'What is the purpose of WeakMap in JavaScript?',
    options: [
      'Store weak references to objects as keys',
      'Create maps with less memory',
      'Store primitive values',
      'Improve performance'
    ],
    correctAnswer: 0
  },
  {
    id: 22,
    difficulty: 'hard',
    question: 'What is memoization in React?',
    options: [
      'Storing component state',
      'Caching computed values to avoid re-computation',
      'Saving data to localStorage',
      'Creating memory leaks'
    ],
    correctAnswer: 1
  },
  {
    id: 23,
    difficulty: 'hard',
    question: 'What is the difference between microtasks and macrotasks?',
    options: [
      'No difference',
      'Microtasks execute before macrotasks in event loop',
      'Macrotasks are faster',
      'Microtasks are deprecated'
    ],
    correctAnswer: 1
  },
  {
    id: 24,
    difficulty: 'hard',
    question: 'What is tree shaking in webpack?',
    options: [
      'Removing unused code from bundles',
      'Optimizing DOM trees',
      'Shaking animations',
      'Testing framework'
    ],
    correctAnswer: 0
  },
  {
    id: 25,
    difficulty: 'hard',
    question: 'What is the purpose of the Proxy object in JavaScript?',
    options: [
      'Network proxy configuration',
      'Intercept and customize operations on objects',
      'Create object copies',
      'Improve performance'
    ],
    correctAnswer: 1
  },
  {
    id: 26,
    difficulty: 'hard',
    question: 'What is hydration in React SSR?',
    options: [
      'Adding water to components',
      'Attaching event listeners to server-rendered HTML',
      'Loading data from API',
      'Optimizing images'
    ],
    correctAnswer: 1
  },
  {
    id: 27,
    difficulty: 'hard',
    question: 'What is the difference between debouncing and throttling?',
    options: [
      'No difference',
      'Debounce delays execution, throttle limits frequency',
      'Throttle is faster',
      'Debounce is deprecated'
    ],
    correctAnswer: 1
  },
  {
    id: 28,
    difficulty: 'hard',
    question: 'What is a generator function in JavaScript?',
    options: [
      'Creates random numbers',
      'Function that can pause and resume execution',
      'Generates HTML',
      'Creates components'
    ],
    correctAnswer: 1
  },
  {
    id: 29,
    difficulty: 'hard',
    question: 'What is the purpose of Symbol in JavaScript?',
    options: [
      'Mathematical operations',
      'Create unique identifiers',
      'String manipulation',
      'Type checking'
    ],
    correctAnswer: 1
  },
  {
    id: 30,
    difficulty: 'hard',
    question: 'What is the Composition API in Vue 3?',
    options: [
      'CSS composition',
      'Alternative to Options API for organizing component logic',
      'Music composition tool',
      'Image editing API'
    ],
    correctAnswer: 1
  }
];
