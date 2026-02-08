// TuneCasa App Component Pattern
// Login/Register are now modals, redirect old routes to home
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Quiz from './pages/Quiz'
import Certificate from './pages/Certificate'
import Dashboard from './pages/Dashboard'
import MyLearning from './pages/MyLearning'
import AuthCallback from './pages/AuthCallback'

function App() {
    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-900 text-white">
                <Navbar />
                <main>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/course/:id" element={<CourseDetail />} />
                        <Route path="/auth-callback" element={<AuthCallback />} />

                        {/* Redirect old login/register pages to home (use modals now) */}
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="/register" element={<Navigate to="/" replace />} />

                        {/* Protected Routes */}
                        <Route path="/my-learning" element={
                            <ProtectedRoute>
                                <MyLearning />
                            </ProtectedRoute>
                        } />
                        <Route path="/quiz/:id" element={
                            <ProtectedRoute>
                                <Quiz />
                            </ProtectedRoute>
                        } />
                        <Route path="/certificate" element={
                            <ProtectedRoute>
                                <Certificate />
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </main>
            </div>
        </ErrorBoundary>
    )
}

export default App
