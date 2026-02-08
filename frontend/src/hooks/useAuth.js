// TuneCasa Custom Hook - useAuth
// Centralized authentication logic
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutUser, resetStatus } from '../store/authSlice'

export const useAuth = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, token, isAuthenticated, status, error } = useSelector(state => state.auth)

    const logout = () => {
        dispatch(logoutUser())
        navigate('/')
    }

    const reset = () => {
        dispatch(resetStatus())
    }

    return {
        user,
        token,
        isAuthenticated,
        status,
        error,
        logout,
        reset,
    }
}

export default useAuth
