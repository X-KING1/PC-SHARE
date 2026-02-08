// TuneCasa Component - ProtectedRoute
// Route wrapper that requires authentication
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from '../constants'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector(state => state.auth)
    const location = useLocation()

    if (!isAuthenticated) {
        // Redirect to login, save intended destination
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    }

    return children
}

export default ProtectedRoute
