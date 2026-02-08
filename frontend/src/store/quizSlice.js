// TuneCasa Redux Slice Pattern - Quiz
import { createSlice } from "@reduxjs/toolkit";
import { STATUS } from "../globals/Status";
import { API } from "../http";

const quizSlice = createSlice({
    name: "quiz",
    initialState: {
        quizzes: [],
        currentQuiz: null,
        currentAttempt: null,
        currentQuestion: 0,
        answers: [],
        score: null,
        status: STATUS.LOADING,
    },
    reducers: {
        setQuizzes(state, action) {
            state.quizzes = action.payload;
        },
        setCurrentQuiz(state, action) {
            state.currentQuiz = action.payload;
            state.currentQuestion = 0;
            state.answers = [];
            state.score = null;
        },
        setCurrentAttempt(state, action) {
            state.currentAttempt = action.payload;
        },
        nextQuestion(state) {
            state.currentQuestion += 1;
        },
        addAnswer(state, action) {
            state.answers.push(action.payload);
        },
        setScore(state, action) {
            state.score = action.payload;
        },
        setStatus(state, action) {
            state.status = action.payload;
        },
        resetQuiz(state) {
            state.currentQuiz = null;
            state.currentAttempt = null;
            state.currentQuestion = 0;
            state.answers = [];
            state.score = null;
        },
    },
});

export const { setQuizzes, setCurrentQuiz, setCurrentAttempt, nextQuestion, addAnswer, setScore, setStatus, resetQuiz } = quizSlice.actions;
export default quizSlice.reducer;

// Fetch Course Quizzes
export function fetchCourseQuizzes(courseId) {
    return async function fetchCourseQuizzesThunk(dispatch) {
        dispatch(setStatus(STATUS.LOADING));
        try {
            const response = await API.get(`/api/quizzes/course/${courseId}`);
            if (response.status === 200) {
                dispatch(setQuizzes(response.data.data));
                dispatch(setStatus(STATUS.SUCCESS));
            } else {
                dispatch(setStatus(STATUS.ERROR));
            }
        } catch (err) {
            console.error(err);
            dispatch(setStatus(STATUS.ERROR));
        }
    };
}

// Fetch Single Quiz
export function fetchSingleQuiz(quizId) {
    return async function fetchSingleQuizThunk(dispatch) {
        dispatch(setStatus(STATUS.LOADING));
        try {
            const response = await API.get(`/api/quizzes/${quizId}`);
            if (response.status === 200) {
                dispatch(setCurrentQuiz(response.data.data));
                dispatch(setStatus(STATUS.SUCCESS));
            } else {
                dispatch(setStatus(STATUS.ERROR));
            }
        } catch (err) {
            console.error(err);
            dispatch(setStatus(STATUS.ERROR));
        }
    };
}

// Start Quiz Attempt
export function startQuizAttempt(quizId, userId) {
    return async function startQuizAttemptThunk(dispatch) {
        try {
            const response = await API.post(`/api/quizzes/${quizId}/start`, { user_id: userId });
            if (response.status === 200) {
                dispatch(setCurrentAttempt(response.data.data));
            }
        } catch (err) {
            console.error(err);
        }
    };
}

// Submit Answer
export function submitAnswer(attemptId, questionId, selectedAnswer) {
    return async function submitAnswerThunk(dispatch) {
        try {
            const response = await API.post(`/api/quizzes/attempt/${attemptId}/answer`, {
                question_id: questionId,
                selected_answer: selectedAnswer
            });
            if (response.status === 200) {
                dispatch(addAnswer(response.data.data));
            }
        } catch (err) {
            console.error(err);
        }
    };
}

// Complete Quiz
export function completeQuiz(attemptId) {
    return async function completeQuizThunk(dispatch) {
        try {
            const response = await API.post(`/api/quizzes/attempt/${attemptId}/complete`);
            if (response.status === 200) {
                dispatch(setScore(response.data.data.score));
            }
        } catch (err) {
            console.error(err);
        }
    };
}
