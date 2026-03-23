// TuneCasa App Component Pattern
// Login/Register are now modals, redirect old routes to home
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import MentorRoute from './components/MentorRoute'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Quiz from './pages/Quiz'
import Certificate from './pages/Certificate'
import AdminDashboard from './pages/AdminDashboard'
import Dashboard from './pages/Dashboard'
import MyLearning from './pages/MyLearning'
import AuthCallback from './pages/AuthCallback'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailure from './pages/PaymentFailure'
import PurchasedCourses from './pages/PurchasedCourses'
import MentorDashboard from './pages/MentorDashboard'
import Forum from './pages/Forum'
import useAuth from './hooks/useAuth'

// Redirects admin users to /admin from any non-admin page
const AdminRedirect = ({ children }) => {
    const { user, isAuthenticated } = useAuth()
    const location = useLocation()

    if (isAuthenticated && user?.role === 'admin' && !location.pathname.startsWith('/admin') && location.pathname !== '/auth-callback') {
        return <Navigate to="/admin" replace />
    }
    return children
}

function App() {
    const location = useLocation()
    const isAdminPage = location.pathname.startsWith('/admin')

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-900 text-white">
                {!isAdminPage && <Navbar />}
                <main>
                    <Routes>
                        {/* Admin Dashboard — no redirect wrapper needed */}
                        <Route path="/admin" element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        } />

                        {/* Auth callback — no redirect */}
                        <Route path="/auth-callback" element={<AuthCallback />} />

                        {/* All other routes — redirect admin users away */}
                        <Route path="/" element={<AdminRedirect><Home /></AdminRedirect>} />
                        <Route path="/courses" element={<AdminRedirect><Courses /></AdminRedirect>} />
                        <Route path="/course/:id" element={<AdminRedirect><CourseDetail /></AdminRedirect>} />
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="/register" element={<Navigate to="/" replace />} />
                        <Route path="/payment-success" element={<AdminRedirect><PaymentSuccess /></AdminRedirect>} />
                        <Route path="/payment-failure" element={<AdminRedirect><PaymentFailure /></AdminRedirect>} />

                        {/* Protected Routes */}
                        <Route path="/my-learning" element={
                            <ProtectedRoute><AdminRedirect><MyLearning /></AdminRedirect></ProtectedRoute>
                        } />
                        <Route path="/purchased-courses" element={
                            <ProtectedRoute><AdminRedirect><PurchasedCourses /></AdminRedirect></ProtectedRoute>
                        } />
                        <Route path="/quiz/:id" element={
                            <ProtectedRoute><AdminRedirect><Quiz /></AdminRedirect></ProtectedRoute>
                        } />
                        <Route path="/certificate" element={
                            <ProtectedRoute><AdminRedirect><Certificate /></AdminRedirect></ProtectedRoute>
                        } />
                        <Route path="/dashboard" element={
                            <ProtectedRoute><AdminRedirect><Dashboard /></AdminRedirect></ProtectedRoute>
                        } />
                        <Route path="/forum" element={
                            <ProtectedRoute><AdminRedirect><Forum /></AdminRedirect></ProtectedRoute>
                        } />
                        <Route path="/mentor" element={
                            <MentorRoute><AdminRedirect><MentorDashboard /></AdminRedirect></MentorRoute>
                        } />
                    </Routes>
                </main>
            </div>
        </ErrorBoundary>
    )
}

export default App

