// AdminRoute — Only allows admin users
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const AdminRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth()

    if (!isAuthenticated) return <Navigate to="/" replace />
    if (user?.role !== 'admin') return <Navigate to="/" replace />

    return children
}

export default AdminRoute
